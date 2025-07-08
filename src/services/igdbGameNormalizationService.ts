import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface IGDBGameData {
  id: number;
  name: string;
  summary?: string;
  storyline?: string;
  cover?: {
    id: number;
    image_id: string;
    url?: string;
    width?: number;
    height?: number;
    alpha_channel?: boolean;
    animated?: boolean;
    checksum?: string;
  };
  platforms?: number[];
  genres?: Array<{
    id: number;
    name: string;
    slug?: string;
    url?: string;
    checksum?: string;
  }>;
  screenshots?: Array<{
    id: number;
    image_id: string;
    url?: string;
    width?: number;
    height?: number;
    alpha_channel?: boolean;
    animated?: boolean;
    checksum?: string;
  }>;
  artworks?: Array<{
    id: number;
    image_id: string;
    url?: string;
    width?: number;
    height?: number;
    alpha_channel?: boolean;
    animated?: boolean;
    checksum?: string;
  }>;
  franchises?: Array<{
    id: number;
    name: string;
    slug?: string;
    url?: string;
    checksum?: string;
  }>;
  multiplayer_modes?: Array<{
    id: number;
    campaign_coop?: boolean;
    dropin?: boolean;
    lancoop?: boolean;
    offline_coop?: boolean;
    offline_coop_max?: number;
    offline_max?: number;
    online_coop?: boolean;
    online_coop_max?: number;
    online_max?: number;
    splitscreen?: boolean;
    splitscreen_online?: boolean;
    checksum?: string;
  }>;
  alternative_names?: Array<{
    id: number;
    name: string;
    comment?: string;
    checksum?: string;
  }>;
  game_modes?: Array<{
    id: number;
    name: string;
    slug?: string;
    url?: string;
    checksum?: string;
    created_at?: number;
    updated_at?: number;
  }>;
  player_perspectives?: Array<{
    id: number;
    name: string;
    slug?: string;
    url?: string;
    checksum?: string;
    created_at?: number;
    updated_at?: number;
  }>;
  game_engines?: Array<{
    id: number;
    name: string;
    slug?: string;
    url?: string;
    checksum?: string;
    created_at?: number;
    updated_at?: number;
    description?: string;
    logo?: number;
    platforms?: number[];
    companies?: number[];
  }>;
  themes?: Array<{
    id: number;
    name: string;
    slug?: string;
    url?: string;
    checksum?: string;
    created_at?: number;
    updated_at?: number;
  }>;
  keywords?: Array<{
    id: number;
    name: string;
    slug?: string;
    url?: string;
    checksum?: string;
    created_at?: number;
    updated_at?: number;
  }>;
  involved_companies?: Array<{
    id: number;
    checksum?: string;
    company: number;
    created_at?: number;
    updated_at?: number;
    developer?: boolean;
    porting?: boolean;
    publisher?: boolean;
    supporting?: boolean;
  }>;
  release_dates?: Array<{
    id: number;
    checksum?: string;
    created_at?: number;
    updated_at?: number;
    category?: number;
    date?: number;
    human?: string;
    m?: number;
    platform?: number;
    region?: number;
    y?: number;
    status?: number;
  }>;
  age_ratings?: Array<{
    id: number;
    checksum?: string;
    category?: number;
    created_at?: number;
    updated_at?: number;
    rating?: number;
    rating_cover_url?: string;
    synopsis?: string;
    content_descriptions?: number[];
  }>;
  websites?: Array<{
    id: number;
    checksum?: string;
    category?: number;
    created_at?: number;
    updated_at?: number;
    trusted?: boolean;
    url?: string;
  }>;
  external_games?: Array<{
    id: number;
    checksum?: string;
    category?: number;
    created_at?: number;
    updated_at?: number;
    name?: string;
    uid?: string;
    url?: string;
    year?: number;
    media?: number;
    platform?: number;
    countries?: number[];
  }>;
  videos?: Array<{
    id: number;
    checksum?: string;
    name?: string;
    video_id?: string;
    created_at?: number;
    updated_at?: number;
  }>;
  language_supports?: Array<{
    id: number;
    checksum?: string;
    created_at?: number;
    updated_at?: number;
    language?: number;
    language_support_type?: number;
  }>;
  game_localizations?: Array<{
    id: number;
    checksum?: string;
    created_at?: number;
    updated_at?: number;
    name?: string;
    region?: number;
    cover?: number;
  }>;
  first_release_date?: number;
  rating?: number;
  aggregated_rating?: number;
  aggregated_rating_count?: number;
  total_rating?: number;
  total_rating_count?: number;
  rating_count?: number;
  slug?: string;
  url?: string;
  checksum?: string;
}

export class IGDBGameNormalizationService {
  static async normalizeAndStoreGame(igdbGameData: IGDBGameData): Promise<void> {
    console.log(`🎮 Normalizing IGDB game: ${igdbGameData.name} (ID: ${igdbGameData.id})`);

    try {
      // Start transaction for atomic operation
      await prisma.$transaction(async (tx) => {
        // 1. Store cover if exists
        if (igdbGameData.cover) {
          await tx.igdbCover.upsert({
            where: { id: igdbGameData.cover.id },
            update: {
              alphaChannel: igdbGameData.cover.alpha_channel,
              animated: igdbGameData.cover.animated,
              checksum: igdbGameData.cover.checksum,
              height: igdbGameData.cover.height,
              imageId: igdbGameData.cover.image_id,
              url: igdbGameData.cover.url,
              width: igdbGameData.cover.width,
            },
            create: {
              id: igdbGameData.cover.id,
              alphaChannel: igdbGameData.cover.alpha_channel,
              animated: igdbGameData.cover.animated,
              checksum: igdbGameData.cover.checksum,
              height: igdbGameData.cover.height,
              imageId: igdbGameData.cover.image_id,
              url: igdbGameData.cover.url,
              width: igdbGameData.cover.width,
            },
          });
        }

        // 2. Store screenshots
        if (igdbGameData.screenshots && igdbGameData.screenshots.length > 0) {
          for (const screenshot of igdbGameData.screenshots) {
            await tx.igdbScreenshot.upsert({
              where: { id: screenshot.id },
              update: {
                alphaChannel: screenshot.alpha_channel,
                animated: screenshot.animated,
                checksum: screenshot.checksum,
                height: screenshot.height,
                imageId: screenshot.image_id,
                url: screenshot.url,
                width: screenshot.width,
              },
              create: {
                id: screenshot.id,
                alphaChannel: screenshot.alpha_channel,
                animated: screenshot.animated,
                checksum: screenshot.checksum,
                height: screenshot.height,
                imageId: screenshot.image_id,
                url: screenshot.url,
                width: screenshot.width,
              },
            });
          }
        }

        // 3. Store artworks
        if (igdbGameData.artworks && igdbGameData.artworks.length > 0) {
          for (const artwork of igdbGameData.artworks) {
            await tx.igdbArtwork.upsert({
              where: { id: artwork.id },
              update: {
                alphaChannel: artwork.alpha_channel,
                animated: artwork.animated,
                checksum: artwork.checksum,
                height: artwork.height,
                imageId: artwork.image_id,
                url: artwork.url,
                width: artwork.width,
              },
              create: {
                id: artwork.id,
                alphaChannel: artwork.alpha_channel,
                animated: artwork.animated,
                checksum: artwork.checksum,
                height: artwork.height,
                imageId: artwork.image_id,
                url: artwork.url,
                width: artwork.width,
              },
            });
          }
        }

        // 4. Store genres
        if (igdbGameData.genres && igdbGameData.genres.length > 0) {
          for (const genre of igdbGameData.genres) {
            await tx.igdbGenre.upsert({
              where: { id: genre.id },
              update: {
                checksum: genre.checksum,
                name: genre.name,
                slug: genre.slug,
                url: genre.url,
              },
              create: {
                id: genre.id,
                checksum: genre.checksum,
                name: genre.name,
                slug: genre.slug,
                url: genre.url,
              },
            });
          }
        }

        // 5. Store franchises
        if (igdbGameData.franchises && igdbGameData.franchises.length > 0) {
          for (const franchise of igdbGameData.franchises) {
            await tx.igdbFranchise.upsert({
              where: { id: franchise.id },
              update: {
                checksum: franchise.checksum,
                name: franchise.name,
                slug: franchise.slug,
                url: franchise.url,
              },
              create: {
                id: franchise.id,
                checksum: franchise.checksum,
                name: franchise.name,
                slug: franchise.slug,
                url: franchise.url,
              },
            });
          }
        }

        // 6. Store alternative names
        if (igdbGameData.alternative_names && igdbGameData.alternative_names.length > 0) {
          for (const altName of igdbGameData.alternative_names) {
            await tx.igdbAlternativeName.upsert({
              where: { id: altName.id },
              update: {
                name: altName.name,
                comment: altName.comment,
                checksum: altName.checksum,
              },
              create: {
                id: altName.id,
                name: altName.name,
                comment: altName.comment,
                checksum: altName.checksum,
              },
            });
          }
        }

        // 7. Store game modes
        if (igdbGameData.game_modes && igdbGameData.game_modes.length > 0) {
          for (const gameMode of igdbGameData.game_modes) {
            await tx.igdbGameMode.upsert({
              where: { id: gameMode.id },
              update: {
                name: gameMode.name,
                slug: gameMode.slug,
                url: gameMode.url,
                checksum: gameMode.checksum,
                createdAt: gameMode.created_at ? BigInt(gameMode.created_at) : null,
                updatedAt: gameMode.updated_at ? BigInt(gameMode.updated_at) : null,
              },
              create: {
                id: gameMode.id,
                name: gameMode.name,
                slug: gameMode.slug,
                url: gameMode.url,
                checksum: gameMode.checksum,
                createdAt: gameMode.created_at ? BigInt(gameMode.created_at) : null,
                updatedAt: gameMode.updated_at ? BigInt(gameMode.updated_at) : null,
              },
            });
          }
        }

        // 8. Store player perspectives
        if (igdbGameData.player_perspectives && igdbGameData.player_perspectives.length > 0) {
          for (const perspective of igdbGameData.player_perspectives) {
            await tx.igdbPlayerPerspective.upsert({
              where: { id: perspective.id },
              update: {
                name: perspective.name,
                slug: perspective.slug,
                url: perspective.url,
                checksum: perspective.checksum,
                createdAt: perspective.created_at ? BigInt(perspective.created_at) : null,
                updatedAt: perspective.updated_at ? BigInt(perspective.updated_at) : null,
              },
              create: {
                id: perspective.id,
                name: perspective.name,
                slug: perspective.slug,
                url: perspective.url,
                checksum: perspective.checksum,
                createdAt: perspective.created_at ? BigInt(perspective.created_at) : null,
                updatedAt: perspective.updated_at ? BigInt(perspective.updated_at) : null,
              },
            });
          }
        }

        // 9. Store game engines
        if (igdbGameData.game_engines && igdbGameData.game_engines.length > 0) {
          for (const engine of igdbGameData.game_engines) {
            await tx.igdbGameEngine.upsert({
              where: { id: engine.id },
              update: {
                name: engine.name,
                slug: engine.slug,
                url: engine.url,
                checksum: engine.checksum,
                createdAt: engine.created_at ? BigInt(engine.created_at) : null,
                updatedAt: engine.updated_at ? BigInt(engine.updated_at) : null,
                description: engine.description,
                logo: engine.logo,
                platforms: engine.platforms || [],
                companies: engine.companies || [],
              },
              create: {
                id: engine.id,
                name: engine.name,
                slug: engine.slug,
                url: engine.url,
                checksum: engine.checksum,
                createdAt: engine.created_at ? BigInt(engine.created_at) : null,
                updatedAt: engine.updated_at ? BigInt(engine.updated_at) : null,
                description: engine.description,
                logo: engine.logo,
                platforms: engine.platforms || [],
                companies: engine.companies || [],
              },
            });
          }
        }

        // 10. Store themes
        if (igdbGameData.themes && igdbGameData.themes.length > 0) {
          for (const theme of igdbGameData.themes) {
            await tx.igdbTheme.upsert({
              where: { id: theme.id },
              update: {
                name: theme.name,
                slug: theme.slug,
                url: theme.url,
                checksum: theme.checksum,
                createdAt: theme.created_at ? BigInt(theme.created_at) : null,
                updatedAt: theme.updated_at ? BigInt(theme.updated_at) : null,
              },
              create: {
                id: theme.id,
                name: theme.name,
                slug: theme.slug,
                url: theme.url,
                checksum: theme.checksum,
                createdAt: theme.created_at ? BigInt(theme.created_at) : null,
                updatedAt: theme.updated_at ? BigInt(theme.updated_at) : null,
              },
            });
          }
        }

        // 11. Store keywords
        if (igdbGameData.keywords && igdbGameData.keywords.length > 0) {
          for (const keyword of igdbGameData.keywords) {
            await tx.igdbKeyword.upsert({
              where: { id: keyword.id },
              update: {
                name: keyword.name,
                slug: keyword.slug,
                url: keyword.url,
                checksum: keyword.checksum,
                createdAt: keyword.created_at ? BigInt(keyword.created_at) : null,
                updatedAt: keyword.updated_at ? BigInt(keyword.updated_at) : null,
              },
              create: {
                id: keyword.id,
                name: keyword.name,
                slug: keyword.slug,
                url: keyword.url,
                checksum: keyword.checksum,
                createdAt: keyword.created_at ? BigInt(keyword.created_at) : null,
                updatedAt: keyword.updated_at ? BigInt(keyword.updated_at) : null,
              },
            });
          }
        }

        // 12. Store involved companies
        if (igdbGameData.involved_companies && igdbGameData.involved_companies.length > 0) {
          for (const involvedCompany of igdbGameData.involved_companies) {
            await tx.igdbInvolvedCompany.upsert({
              where: { id: involvedCompany.id },
              update: {
                checksum: involvedCompany.checksum,
                company: involvedCompany.company,
                createdAt: involvedCompany.created_at ? BigInt(involvedCompany.created_at) : null,
                updatedAt: involvedCompany.updated_at ? BigInt(involvedCompany.updated_at) : null,
                developer: involvedCompany.developer,
                porting: involvedCompany.porting,
                publisher: involvedCompany.publisher,
                supporting: involvedCompany.supporting,
              },
              create: {
                id: involvedCompany.id,
                checksum: involvedCompany.checksum,
                company: involvedCompany.company,
                createdAt: involvedCompany.created_at ? BigInt(involvedCompany.created_at) : null,
                updatedAt: involvedCompany.updated_at ? BigInt(involvedCompany.updated_at) : null,
                developer: involvedCompany.developer,
                porting: involvedCompany.porting,
                publisher: involvedCompany.publisher,
                supporting: involvedCompany.supporting,
              },
            });
          }
        }

        // 13. Store release dates
        if (igdbGameData.release_dates && igdbGameData.release_dates.length > 0) {
          for (const releaseDate of igdbGameData.release_dates) {
            await tx.igdbReleaseDate.upsert({
              where: { id: releaseDate.id },
              update: {
                checksum: releaseDate.checksum,
                createdAt: releaseDate.created_at ? BigInt(releaseDate.created_at) : null,
                updatedAt: releaseDate.updated_at ? BigInt(releaseDate.updated_at) : null,
                category: releaseDate.category,
                date: releaseDate.date ? BigInt(releaseDate.date) : null,
                human: releaseDate.human,
                m: releaseDate.m,
                platform: releaseDate.platform,
                region: releaseDate.region,
                y: releaseDate.y,
                status: releaseDate.status,
              },
              create: {
                id: releaseDate.id,
                checksum: releaseDate.checksum,
                createdAt: releaseDate.created_at ? BigInt(releaseDate.created_at) : null,
                updatedAt: releaseDate.updated_at ? BigInt(releaseDate.updated_at) : null,
                category: releaseDate.category,
                date: releaseDate.date ? BigInt(releaseDate.date) : null,
                human: releaseDate.human,
                m: releaseDate.m,
                platform: releaseDate.platform,
                region: releaseDate.region,
                y: releaseDate.y,
                status: releaseDate.status,
              },
            });
          }
        }

        // 14. Store age ratings
        if (igdbGameData.age_ratings && igdbGameData.age_ratings.length > 0) {
          for (const ageRating of igdbGameData.age_ratings) {
            await tx.igdbAgeRating.upsert({
              where: { id: ageRating.id },
              update: {
                checksum: ageRating.checksum,
                category: ageRating.category,
                createdAt: ageRating.created_at ? BigInt(ageRating.created_at) : null,
                updatedAt: ageRating.updated_at ? BigInt(ageRating.updated_at) : null,
                rating: ageRating.rating,
                ratingCoverUrl: ageRating.rating_cover_url,
                synopsis: ageRating.synopsis,
                contentDescriptions: ageRating.content_descriptions || [],
              },
              create: {
                id: ageRating.id,
                checksum: ageRating.checksum,
                category: ageRating.category,
                createdAt: ageRating.created_at ? BigInt(ageRating.created_at) : null,
                updatedAt: ageRating.updated_at ? BigInt(ageRating.updated_at) : null,
                rating: ageRating.rating,
                ratingCoverUrl: ageRating.rating_cover_url,
                synopsis: ageRating.synopsis,
                contentDescriptions: ageRating.content_descriptions || [],
              },
            });
          }
        }

        // 15. Store websites
        if (igdbGameData.websites && igdbGameData.websites.length > 0) {
          for (const website of igdbGameData.websites) {
            await tx.igdbWebsite.upsert({
              where: { id: website.id },
              update: {
                checksum: website.checksum,
                category: website.category,
                createdAt: website.created_at ? BigInt(website.created_at) : null,
                updatedAt: website.updated_at ? BigInt(website.updated_at) : null,
                trusted: website.trusted,
                url: website.url,
              },
              create: {
                id: website.id,
                checksum: website.checksum,
                category: website.category,
                createdAt: website.created_at ? BigInt(website.created_at) : null,
                updatedAt: website.updated_at ? BigInt(website.updated_at) : null,
                trusted: website.trusted,
                url: website.url,
              },
            });
          }
        }

        // 16. Store external games
        if (igdbGameData.external_games && igdbGameData.external_games.length > 0) {
          for (const externalGame of igdbGameData.external_games) {
            await tx.igdbExternalGame.upsert({
              where: { id: externalGame.id },
              update: {
                checksum: externalGame.checksum,
                category: externalGame.category,
                createdAt: externalGame.created_at ? BigInt(externalGame.created_at) : null,
                updatedAt: externalGame.updated_at ? BigInt(externalGame.updated_at) : null,
                name: externalGame.name,
                uid: externalGame.uid,
                url: externalGame.url,
                year: externalGame.year,
                media: externalGame.media,
                platform: externalGame.platform,
                countries: externalGame.countries || [],
              },
              create: {
                id: externalGame.id,
                checksum: externalGame.checksum,
                category: externalGame.category,
                createdAt: externalGame.created_at ? BigInt(externalGame.created_at) : null,
                updatedAt: externalGame.updated_at ? BigInt(externalGame.updated_at) : null,
                name: externalGame.name,
                uid: externalGame.uid,
                url: externalGame.url,
                year: externalGame.year,
                media: externalGame.media,
                platform: externalGame.platform,
                countries: externalGame.countries || [],
              },
            });
          }
        }

        // 17. Store videos
        if (igdbGameData.videos && igdbGameData.videos.length > 0) {
          for (const video of igdbGameData.videos) {
            await tx.igdbVideo.upsert({
              where: { id: video.id },
              update: {
                checksum: video.checksum,
                name: video.name,
                videoId: video.video_id,
                createdAt: video.created_at ? BigInt(video.created_at) : null,
                updatedAt: video.updated_at ? BigInt(video.updated_at) : null,
              },
              create: {
                id: video.id,
                checksum: video.checksum,
                name: video.name,
                videoId: video.video_id,
                createdAt: video.created_at ? BigInt(video.created_at) : null,
                updatedAt: video.updated_at ? BigInt(video.updated_at) : null,
              },
            });
          }
        }

        // 18. Store language supports
        if (igdbGameData.language_supports && igdbGameData.language_supports.length > 0) {
          for (const languageSupport of igdbGameData.language_supports) {
            await tx.igdbLanguageSupport.upsert({
              where: { id: languageSupport.id },
              update: {
                checksum: languageSupport.checksum,
                createdAt: languageSupport.created_at ? BigInt(languageSupport.created_at) : null,
                updatedAt: languageSupport.updated_at ? BigInt(languageSupport.updated_at) : null,
                language: languageSupport.language,
                languageSupportType: languageSupport.language_support_type,
              },
              create: {
                id: languageSupport.id,
                checksum: languageSupport.checksum,
                createdAt: languageSupport.created_at ? BigInt(languageSupport.created_at) : null,
                updatedAt: languageSupport.updated_at ? BigInt(languageSupport.updated_at) : null,
                language: languageSupport.language,
                languageSupportType: languageSupport.language_support_type,
              },
            });
          }
        }

        // 19. Store game localizations
        if (igdbGameData.game_localizations && igdbGameData.game_localizations.length > 0) {
          for (const gameLocalization of igdbGameData.game_localizations) {
            await tx.igdbGameLocalization.upsert({
              where: { id: gameLocalization.id },
              update: {
                checksum: gameLocalization.checksum,
                createdAt: gameLocalization.created_at ? BigInt(gameLocalization.created_at) : null,
                updatedAt: gameLocalization.updated_at ? BigInt(gameLocalization.updated_at) : null,
                name: gameLocalization.name,
                region: gameLocalization.region,
                cover: gameLocalization.cover,
              },
              create: {
                id: gameLocalization.id,
                checksum: gameLocalization.checksum,
                createdAt: gameLocalization.created_at ? BigInt(gameLocalization.created_at) : null,
                updatedAt: gameLocalization.updated_at ? BigInt(gameLocalization.updated_at) : null,
                name: gameLocalization.name,
                region: gameLocalization.region,
                cover: gameLocalization.cover,
              },
            });
          }
        }

        // 20. Store multiplayer modes
        if (igdbGameData.multiplayer_modes && igdbGameData.multiplayer_modes.length > 0) {
          for (const mode of igdbGameData.multiplayer_modes) {
            await tx.igdbMultiplayerMode.upsert({
              where: { id: mode.id },
              update: {
                campaignCoop: mode.campaign_coop,
                checksum: mode.checksum,
                dropin: mode.dropin,
                lancoop: mode.lancoop,
                offlineCoop: mode.offline_coop,
                offlineCoopMax: mode.offline_coop_max,
                offlineMax: mode.offline_max,
                onlineCoop: mode.online_coop,
                onlineCoopMax: mode.online_coop_max,
                onlineMax: mode.online_max,
                splitscreen: mode.splitscreen,
                splitscreenOnline: mode.splitscreen_online,
              },
              create: {
                id: mode.id,
                campaignCoop: mode.campaign_coop,
                checksum: mode.checksum,
                dropin: mode.dropin,
                lancoop: mode.lancoop,
                offlineCoop: mode.offline_coop,
                offlineCoopMax: mode.offline_coop_max,
                offlineMax: mode.offline_max,
                onlineCoop: mode.online_coop,
                onlineCoopMax: mode.online_coop_max,
                onlineMax: mode.online_max,
                splitscreen: mode.splitscreen,
                splitscreenOnline: mode.splitscreen_online,
              },
            });
          }
        }

        // 21. Store the main game record
        const igdbGame = await tx.igdbGame.upsert({
          where: { id: igdbGameData.id },
          update: {
            checksum: igdbGameData.checksum,
            coverId: igdbGameData.cover?.id,
            name: igdbGameData.name,
            slug: igdbGameData.slug,
            summary: igdbGameData.summary,
            storyline: igdbGameData.storyline,
            url: igdbGameData.url,
            aggregatedRating: igdbGameData.aggregated_rating,
            aggregatedRatingCount: igdbGameData.aggregated_rating_count,
            rating: igdbGameData.rating,
            ratingCount: igdbGameData.rating_count,
            totalRating: igdbGameData.total_rating,
            totalRatingCount: igdbGameData.total_rating_count,
            firstReleaseDate: igdbGameData.first_release_date ? BigInt(igdbGameData.first_release_date) : null,
            alternativeNames: igdbGameData.alternative_names?.map(an => an.name) || [],
            platforms: igdbGameData.platforms || [],
            igdbData: JSON.stringify(igdbGameData),
          },
          create: {
            id: igdbGameData.id,
            checksum: igdbGameData.checksum,
            coverId: igdbGameData.cover?.id,
            name: igdbGameData.name,
            slug: igdbGameData.slug,
            summary: igdbGameData.summary,
            storyline: igdbGameData.storyline,
            url: igdbGameData.url,
            aggregatedRating: igdbGameData.aggregated_rating,
            aggregatedRatingCount: igdbGameData.aggregated_rating_count,
            rating: igdbGameData.rating,
            ratingCount: igdbGameData.rating_count,
            totalRating: igdbGameData.total_rating,
            totalRatingCount: igdbGameData.total_rating_count,
            firstReleaseDate: igdbGameData.first_release_date ? BigInt(igdbGameData.first_release_date) : null,
            alternativeNames: igdbGameData.alternative_names?.map(an => an.name) || [],
            platforms: igdbGameData.platforms || [],
            igdbData: JSON.stringify(igdbGameData),
          },
        });

        // 8. Create relationships
        // Screenshots
        if (igdbGameData.screenshots && igdbGameData.screenshots.length > 0) {
          for (const screenshot of igdbGameData.screenshots) {
            await tx.igdbGameScreenshotRelation.upsert({
              where: { 
                gameId_screenshotId: {
                  gameId: igdbGameData.id,
                  screenshotId: screenshot.id
                }
              },
              update: {},
              create: {
                gameId: igdbGameData.id,
                screenshotId: screenshot.id,
              },
            });
          }
        }

        // Artworks
        if (igdbGameData.artworks && igdbGameData.artworks.length > 0) {
          for (const artwork of igdbGameData.artworks) {
            await tx.igdbGameArtworkRelation.upsert({
              where: { 
                gameId_artworkId: {
                  gameId: igdbGameData.id,
                  artworkId: artwork.id
                }
              },
              update: {},
              create: {
                gameId: igdbGameData.id,
                artworkId: artwork.id,
              },
            });
          }
        }

        // Genres
        if (igdbGameData.genres && igdbGameData.genres.length > 0) {
          for (const genre of igdbGameData.genres) {
            await tx.igdbGameGenreRelation.upsert({
              where: { 
                gameId_genreId: {
                  gameId: igdbGameData.id,
                  genreId: genre.id
                }
              },
              update: {},
              create: {
                gameId: igdbGameData.id,
                genreId: genre.id,
              },
            });
          }
        }

        // Franchises
        if (igdbGameData.franchises && igdbGameData.franchises.length > 0) {
          for (const franchise of igdbGameData.franchises) {
            await tx.igdbGameFranchiseRelation.upsert({
              where: { 
                gameId_franchiseId: {
                  gameId: igdbGameData.id,
                  franchiseId: franchise.id
                }
              },
              update: {},
              create: {
                gameId: igdbGameData.id,
                franchiseId: franchise.id,
              },
            });
          }
        }

        // Multiplayer modes
        if (igdbGameData.multiplayer_modes && igdbGameData.multiplayer_modes.length > 0) {
          for (const mode of igdbGameData.multiplayer_modes) {
            await tx.igdbGameMultiplayerRelation.upsert({
              where: { 
                gameId_multiplayerModeId: {
                  gameId: igdbGameData.id,
                  multiplayerModeId: mode.id
                }
              },
              update: {},
              create: {
                gameId: igdbGameData.id,
                multiplayerModeId: mode.id,
              },
            });
          }
        }

        // Alternative names
        if (igdbGameData.alternative_names && igdbGameData.alternative_names.length > 0) {
          for (const altName of igdbGameData.alternative_names) {
            await tx.igdbGameAlternativeNameRelation.upsert({
              where: { 
                gameId_alternativeNameId: {
                  gameId: igdbGameData.id,
                  alternativeNameId: altName.id
                }
              },
              update: {},
              create: {
                gameId: igdbGameData.id,
                alternativeNameId: altName.id,
              },
            });
          }
        }

        // Game modes
        if (igdbGameData.game_modes && igdbGameData.game_modes.length > 0) {
          for (const gameMode of igdbGameData.game_modes) {
            await tx.igdbGameModeRelation.upsert({
              where: { 
                gameId_gameModeId: {
                  gameId: igdbGameData.id,
                  gameModeId: gameMode.id
                }
              },
              update: {},
              create: {
                gameId: igdbGameData.id,
                gameModeId: gameMode.id,
              },
            });
          }
        }

        // Player perspectives
        if (igdbGameData.player_perspectives && igdbGameData.player_perspectives.length > 0) {
          for (const perspective of igdbGameData.player_perspectives) {
            await tx.igdbGamePlayerPerspectiveRelation.upsert({
              where: { 
                gameId_playerPerspectiveId: {
                  gameId: igdbGameData.id,
                  playerPerspectiveId: perspective.id
                }
              },
              update: {},
              create: {
                gameId: igdbGameData.id,
                playerPerspectiveId: perspective.id,
              },
            });
          }
        }

        // Game engines
        if (igdbGameData.game_engines && igdbGameData.game_engines.length > 0) {
          for (const engine of igdbGameData.game_engines) {
            await tx.igdbGameEngineRelation.upsert({
              where: { 
                gameId_gameEngineId: {
                  gameId: igdbGameData.id,
                  gameEngineId: engine.id
                }
              },
              update: {},
              create: {
                gameId: igdbGameData.id,
                gameEngineId: engine.id,
              },
            });
          }
        }

        // Themes
        if (igdbGameData.themes && igdbGameData.themes.length > 0) {
          for (const theme of igdbGameData.themes) {
            await tx.igdbGameThemeRelation.upsert({
              where: { 
                gameId_themeId: {
                  gameId: igdbGameData.id,
                  themeId: theme.id
                }
              },
              update: {},
              create: {
                gameId: igdbGameData.id,
                themeId: theme.id,
              },
            });
          }
        }

        // Keywords
        if (igdbGameData.keywords && igdbGameData.keywords.length > 0) {
          for (const keyword of igdbGameData.keywords) {
            await tx.igdbGameKeywordRelation.upsert({
              where: { 
                gameId_keywordId: {
                  gameId: igdbGameData.id,
                  keywordId: keyword.id
                }
              },
              update: {},
              create: {
                gameId: igdbGameData.id,
                keywordId: keyword.id,
              },
            });
          }
        }

        // Involved companies
        if (igdbGameData.involved_companies && igdbGameData.involved_companies.length > 0) {
          for (const involvedCompany of igdbGameData.involved_companies) {
            await tx.igdbGameInvolvedCompanyRelation.upsert({
              where: { 
                gameId_involvedCompanyId: {
                  gameId: igdbGameData.id,
                  involvedCompanyId: involvedCompany.id
                }
              },
              update: {},
              create: {
                gameId: igdbGameData.id,
                involvedCompanyId: involvedCompany.id,
              },
            });
          }
        }

        // Release dates
        if (igdbGameData.release_dates && igdbGameData.release_dates.length > 0) {
          for (const releaseDate of igdbGameData.release_dates) {
            await tx.igdbGameReleaseDateRelation.upsert({
              where: { 
                gameId_releaseDateId: {
                  gameId: igdbGameData.id,
                  releaseDateId: releaseDate.id
                }
              },
              update: {},
              create: {
                gameId: igdbGameData.id,
                releaseDateId: releaseDate.id,
              },
            });
          }
        }

        // Age ratings
        if (igdbGameData.age_ratings && igdbGameData.age_ratings.length > 0) {
          for (const ageRating of igdbGameData.age_ratings) {
            await tx.igdbGameAgeRatingRelation.upsert({
              where: { 
                gameId_ageRatingId: {
                  gameId: igdbGameData.id,
                  ageRatingId: ageRating.id
                }
              },
              update: {},
              create: {
                gameId: igdbGameData.id,
                ageRatingId: ageRating.id,
              },
            });
          }
        }

        // Websites
        if (igdbGameData.websites && igdbGameData.websites.length > 0) {
          for (const website of igdbGameData.websites) {
            await tx.igdbGameWebsiteRelation.upsert({
              where: { 
                gameId_websiteId: {
                  gameId: igdbGameData.id,
                  websiteId: website.id
                }
              },
              update: {},
              create: {
                gameId: igdbGameData.id,
                websiteId: website.id,
              },
            });
          }
        }

        // External games
        if (igdbGameData.external_games && igdbGameData.external_games.length > 0) {
          for (const externalGame of igdbGameData.external_games) {
            await tx.igdbGameExternalGameRelation.upsert({
              where: { 
                gameId_externalGameId: {
                  gameId: igdbGameData.id,
                  externalGameId: externalGame.id
                }
              },
              update: {},
              create: {
                gameId: igdbGameData.id,
                externalGameId: externalGame.id,
              },
            });
          }
        }

        // Videos
        if (igdbGameData.videos && igdbGameData.videos.length > 0) {
          for (const video of igdbGameData.videos) {
            await tx.igdbGameVideoRelation.upsert({
              where: { 
                gameId_videoId: {
                  gameId: igdbGameData.id,
                  videoId: video.id
                }
              },
              update: {},
              create: {
                gameId: igdbGameData.id,
                videoId: video.id,
              },
            });
          }
        }

        // Language supports
        if (igdbGameData.language_supports && igdbGameData.language_supports.length > 0) {
          for (const languageSupport of igdbGameData.language_supports) {
            await tx.igdbGameLanguageSupportRelation.upsert({
              where: { 
                gameId_languageSupportId: {
                  gameId: igdbGameData.id,
                  languageSupportId: languageSupport.id
                }
              },
              update: {},
              create: {
                gameId: igdbGameData.id,
                languageSupportId: languageSupport.id,
              },
            });
          }
        }

        // Game localizations
        if (igdbGameData.game_localizations && igdbGameData.game_localizations.length > 0) {
          for (const gameLocalization of igdbGameData.game_localizations) {
            await tx.igdbGameLocalizationRelation.upsert({
              where: { 
                gameId_gameLocalizationId: {
                  gameId: igdbGameData.id,
                  gameLocalizationId: gameLocalization.id
                }
              },
              update: {},
              create: {
                gameId: igdbGameData.id,
                gameLocalizationId: gameLocalization.id,
              },
            });
          }
        }
      });

      console.log(`✅ Successfully normalized and stored IGDB game: ${igdbGameData.name}`);
    } catch (error) {
      console.error(`❌ Failed to normalize IGDB game ${igdbGameData.name}:`, error);
      throw error;
    }
  }

  static async createUserGameFromIGDB(
    userId: string,
    igdbGameData: IGDBGameData,
    consoleId: number,
    additionalData?: {
      condition?: string;
      price?: number;
      purchaseDate?: Date;
      notes?: string;
    }
  ): Promise<any> {
    console.log(`🎯 Creating user game from IGDB: ${igdbGameData.name} for user ${userId} on console ${consoleId}`);

    try {
      // First, normalize and store the IGDB data
      await this.normalizeAndStoreGame(igdbGameData);

      // Helper function to get cover URL
      const getCoverUrl = (cover: any) => {
        if (!cover?.image_id) return null;
        return `https://images.igdb.com/igdb/image/upload/t_cover_big/${cover.image_id}.jpg`;
      };

      // Helper function to get first screenshot URL
      const getFirstScreenshotUrl = (screenshots: any[]) => {
        if (!screenshots || screenshots.length === 0) return null;
        return `https://images.igdb.com/igdb/image/upload/t_screenshot_med/${screenshots[0].image_id}.jpg`;
      };

      // Create the user's game record
      const userGame = await prisma.game.create({
        data: {
          userId,
          igdbGameId: igdbGameData.id,
          title: igdbGameData.name,
          alternativeNames: igdbGameData.alternative_names?.map(an => an.name) || [],
          cover: getCoverUrl(igdbGameData.cover),
          screenshot: getFirstScreenshotUrl(igdbGameData.screenshots || []),
          summary: igdbGameData.summary,
          genres: igdbGameData.genres?.map(g => g.name) || [],
          franchises: igdbGameData.franchises?.map(f => f.name) || [],
          platforms: igdbGameData.platforms || [], // Array of IGDB platform IDs
          rating: igdbGameData.total_rating || igdbGameData.aggregated_rating || igdbGameData.rating,
          multiplayerModes: igdbGameData.multiplayer_modes?.map(mm => {
            const modes = [];
            if (mm.offline_coop) modes.push(`Offline Co-op (${mm.offline_coop_max || 'N/A'} players)`);
            if (mm.online_coop) modes.push(`Online Co-op (${mm.online_coop_max || 'N/A'} players)`);
            if (mm.splitscreen) modes.push('Splitscreen');
            if (mm.campaign_coop) modes.push('Campaign Co-op');
            return modes.length > 0 ? modes.join(', ') : 'Multiplayer';
          }) || [],
          consoleId: consoleId, // User's specific console
          condition: (additionalData?.condition as any) || 'GOOD',
          price: additionalData?.price,
          purchaseDate: additionalData?.purchaseDate,
          notes: additionalData?.notes,
          releaseYear: igdbGameData.first_release_date 
            ? new Date(igdbGameData.first_release_date * 1000).getFullYear() 
            : null,
          photo: additionalData?.photo || undefined,
        },
      });

      console.log(`✅ Successfully created user game: ${userGame.title} (ID: ${userGame.id})`);
      return userGame;
    } catch (error) {
      console.error(`❌ Failed to create user game from IGDB:`, error);
      throw error;
    }
  }
}

export default IGDBGameNormalizationService;
