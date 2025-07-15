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
  franchise?: number; // Main franchise ID
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
  game_type?: number; 
  remakes?: number[];
  remasters?: number[];
  created_at?: number; // IGDB UNIX timestamp (seconds since epoch)
  parent_game?: number; // IGDB parent_game reference (DLC/expansion/bundle main game)
  version_parent?: number; // IGDB version_parent reference (main game for versions)
}

export class IGDBGameNormalizationService {
  static async normalizeAndStoreGame(igdbGameData: IGDBGameData): Promise<void> {
    console.log(`🎮 Normalizing IGDB game: ${igdbGameData.name} (ID: ${igdbGameData.id})`);

    // Helper to batch upserts
    const batchUpsert = async <T>(items: T[], batchSize: number, upsertFn: (item: T) => Promise<any>) => {
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        await Promise.all(batch.map(upsertFn));
      }
    };

    try {
      // 1. Upsert all main entities in a transaction (single-record upserts only)
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
          await Promise.all(
            igdbGameData.screenshots.map(screenshot =>
              tx.igdbScreenshot.upsert({
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
              })
            )
          );
        }

        // 3. Store artworks
        if (igdbGameData.artworks && igdbGameData.artworks.length > 0) {
          await Promise.all(
            igdbGameData.artworks.map(artwork =>
              tx.igdbArtwork.upsert({
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
              })
            )
          );
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
                gameId: igdbGameData.id,
              },
              create: {
                id: altName.id,
                name: altName.name,
                comment: altName.comment,
                checksum: altName.checksum,
                gameId: igdbGameData.id,
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




        // 14. Store age ratings
        if (igdbGameData.age_ratings && igdbGameData.age_ratings.length > 0) {
          for (const ageRating of igdbGameData.age_ratings) {
            await tx.igdbAgeRating.upsert({
              where: { id: ageRating.id },
              update: {
                checksum: ageRating.checksum,
                ratingCategoryId: ageRating.rating,
                ratingCoverUrl: ageRating.rating_cover_url,
                synopsis: ageRating.synopsis,
                contentDescriptions: ageRating.content_descriptions || [],
              },
              create: {
                id: ageRating.id,
                checksum: ageRating.checksum,
                ratingCategoryId: ageRating.rating,
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
                trusted: website.trusted,
                url: website.url || "",
              },
              create: {
                id: website.id,
                checksum: website.checksum,
                trusted: website.trusted,
                url: website.url || "",
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
              },
              create: {
                id: video.id,
                checksum: video.checksum,
                name: video.name,
                videoId: video.video_id,
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
                languageId: languageSupport.language,
                languageSupportTypeId: languageSupport.language_support_type,
              },
              create: {
                id: languageSupport.id,
                checksum: languageSupport.checksum,
                languageId: languageSupport.language,
                languageSupportTypeId: languageSupport.language_support_type,
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

        await tx.igdbGame.upsert({
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
            alternativeNames: igdbGameData.alternative_names?.map(an => an.id) || [],
            platforms: igdbGameData.platforms || [],
            franchiseId: igdbGameData.franchise ?? null,
            parentGameId: igdbGameData.parent_game ?? null,
            versionParentId: igdbGameData.version_parent ?? null,
            gameType: igdbGameData.game_type !== undefined ? igdbGameData.game_type : null,
            remakes: igdbGameData.remakes || [],
            remasters: igdbGameData.remasters || [],
            createdAt: igdbGameData.created_at !== undefined ? BigInt(igdbGameData.created_at) : undefined,
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
            alternativeNames: igdbGameData.alternative_names?.map(an => an.id) || [],
            platforms: igdbGameData.platforms || [],
            franchiseId: igdbGameData.franchise ?? null,
            parentGameId: igdbGameData.parent_game ?? null,
            versionParentId: igdbGameData.version_parent ?? null,
            gameType: igdbGameData.game_type !== undefined ? igdbGameData.game_type : null,
            remakes: igdbGameData.remakes || [],
            remasters: igdbGameData.remasters || [],
            createdAt: igdbGameData.created_at !== undefined ? BigInt(igdbGameData.created_at) : undefined,
          },
        });
      });

      // 2. Upsert all many-to-many relations OUTSIDE the transaction (to avoid transaction timeouts)
      // Screenshots
      if (igdbGameData.screenshots && igdbGameData.screenshots.length > 0) {
        await batchUpsert(
          igdbGameData.screenshots,
          20,
          (screenshot: { id: number }) => prisma.igdbGameScreenshotRelation.upsert({
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
          })
        );
      }

      // Artworks
      if (igdbGameData.artworks && igdbGameData.artworks.length > 0) {
        await batchUpsert(
          igdbGameData.artworks,
          20,
          (artwork: { id: number }) => prisma.igdbGameArtworkRelation.upsert({
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
          })
        );
      }

      // Genres
      if (igdbGameData.genres && igdbGameData.genres.length > 0) {
        await batchUpsert(
          igdbGameData.genres,
          20,
          (genre: { id: number }) => prisma.igdbGameGenreRelation.upsert({
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
          })
        );
      }

      // Franchises
      if (igdbGameData.franchises && igdbGameData.franchises.length > 0) {
        await batchUpsert(
          igdbGameData.franchises,
          20,
          (franchise: { id: number }) => prisma.igdbGameFranchiseRelation.upsert({
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
          })
        );
      }

      // Multiplayer modes
      if (igdbGameData.multiplayer_modes && igdbGameData.multiplayer_modes.length > 0) {
        await batchUpsert(
          igdbGameData.multiplayer_modes,
          20,
          (mode: { id: number }) => prisma.igdbGameMultiplayerRelation.upsert({
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
          })
        );
      }

      // Alternative names
      if (igdbGameData.alternative_names && igdbGameData.alternative_names.length > 0) {
        await batchUpsert(
          igdbGameData.alternative_names,
          20,
          (altName: { id: number }) => prisma.igdbGameAlternativeNameRelation.upsert({
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
          })
        );
      }

      // Game modes
      if (igdbGameData.game_modes && igdbGameData.game_modes.length > 0) {
        await batchUpsert(
          igdbGameData.game_modes,
          20,
          (gameMode: { id: number }) => prisma.igdbGameModeRelation.upsert({
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
          })
        );
      }

      // Player perspectives
      if (igdbGameData.player_perspectives && igdbGameData.player_perspectives.length > 0) {
        await batchUpsert(
          igdbGameData.player_perspectives,
          20,
          (perspective: { id: number }) => prisma.igdbGamePlayerPerspectiveRelation.upsert({
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
          })
        );
      }

      // Game engines
      if (igdbGameData.game_engines && igdbGameData.game_engines.length > 0) {
        await batchUpsert(
          igdbGameData.game_engines,
          20,
          (engine: { id: number }) => prisma.igdbGameEngineRelation.upsert({
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
          })
        );
      }

      // Themes
      if (igdbGameData.themes && igdbGameData.themes.length > 0) {
        await batchUpsert(
          igdbGameData.themes,
          20,
          (theme: { id: number }) => prisma.igdbGameThemeRelation.upsert({
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
          })
        );
      }

      // Age ratings
      if (igdbGameData.age_ratings && igdbGameData.age_ratings.length > 0) {
        await batchUpsert(
          igdbGameData.age_ratings,
          20,
          (ageRating: { id: number }) => prisma.igdbGameAgeRatingRelation.upsert({
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
          })
        );
      }

      // Websites
      if (igdbGameData.websites && igdbGameData.websites.length > 0) {
        await batchUpsert(
          igdbGameData.websites,
          20,
          (website: { id: number }) => prisma.igdbGameWebsiteRelation.upsert({
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
          })
        );
      }

      // Videos
      if (igdbGameData.videos && igdbGameData.videos.length > 0) {
        await batchUpsert(
          igdbGameData.videos,
          20,
          (video: { id: number }) => prisma.igdbGameVideoRelation.upsert({
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
          })
        );
      }

      // Language supports
      if (igdbGameData.language_supports && igdbGameData.language_supports.length > 0) {
        await batchUpsert(
          igdbGameData.language_supports,
          20,
          (languageSupport: { id: number }) => prisma.igdbGameLanguageSupportRelation.upsert({
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
          })
        );
      }

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
      photo?: string;
      completeness?: string;
      region?: string;
      labelDamage?: boolean;
      discoloration?: boolean;
      rentalSticker?: boolean;
      testedWorking?: boolean;
      reproduction?: boolean;
      steelbook?: boolean;
            gameLocationId?: string | null;
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


      // Correct extraction of developer and publisher arrays from involved_companies (using developed/published arrays)
      let developers: string[] = [];
      let publishers: string[] = [];
      if (Array.isArray((igdbGameData as any).involved_companies)) {
        const gameId = igdbGameData.id;
        for (const ic of (igdbGameData as any).involved_companies) {
          const company = ic?.company;
          const companyName = company?.name;
          if (!companyName) continue;
          if (Array.isArray(company.developed) && company.developed.includes(gameId)) {
            developers.push(companyName);
          }
          if (Array.isArray(company.published) && company.published.includes(gameId)) {
            publishers.push(companyName);
          }
        }
        // Remove duplicates and filter out empty strings
        developers = Array.from(new Set(developers)).filter(Boolean);
        publishers = Array.from(new Set(publishers)).filter(Boolean);
      }

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
          genres: igdbGameData.genres?.map(g => g.name).filter(Boolean) || [],
          franchises: igdbGameData.franchises?.map(f => f.name).filter(Boolean) || [],
          companies: Array.isArray((igdbGameData as any).involved_companies)
            ? Array.from(new Set((igdbGameData as any).involved_companies.map((ic: any) => ic?.company?.name).filter(Boolean)))
            : [],
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
          consoleIds: [consoleId], // User's specific console as array
          condition: (additionalData?.condition as any) || 'GOOD',
          price: additionalData?.price,
          purchaseDate: additionalData?.purchaseDate,
          notes: additionalData?.notes,
          completeness: (additionalData?.completeness && ["CIB","GAME_BOX","GAME_MANUAL","LOOSE"].includes(additionalData.completeness))
            ? additionalData.completeness as import("@prisma/client").Completeness
            : "CIB",
          region: (additionalData?.region && ["REGION_FREE","NTSC_U","NTSC_J","PAL"].includes(additionalData.region))
            ? additionalData.region as import("@prisma/client").Region
            : "REGION_FREE",
          labelDamage: !!additionalData?.labelDamage,
          discoloration: !!additionalData?.discoloration,
          rentalSticker: !!additionalData?.rentalSticker,
          testedWorking: typeof additionalData?.testedWorking === 'boolean' ? additionalData.testedWorking : true,
          reproduction: !!additionalData?.reproduction,
          releaseYear: igdbGameData.first_release_date 
            ? new Date(igdbGameData.first_release_date * 1000).getFullYear() 
            : null,
          photos: additionalData?.photo ? [additionalData.photo] : [],
          developer: developers,
          publisher: publishers,
          steelbook: !!additionalData?.steelbook,
                     ...(additionalData?.gameLocationId ? { gameLocationId: additionalData.gameLocationId } : {}),
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
