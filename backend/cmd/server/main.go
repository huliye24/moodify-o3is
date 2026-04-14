package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"

	"backend/internal/config"
	"backend/internal/handler"
	"backend/internal/library"
	"backend/internal/middleware"
	"backend/internal/model"
	"backend/internal/repository"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	cfg := config.LoadConfig()

	// 确保数据目录存在
	if err := os.MkdirAll("./data", 0755); err != nil {
		log.Fatalf("创建数据目录失败: %v", err)
	}

	// 获取数据库路径的绝对路径
	dbPath, _ := filepath.Abs(cfg.Database.Path)
	log.Printf("数据库路径: %s", dbPath)

	// 使用纯 Go 的 SQLite 驱动 (modernc.org/sqlite)
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		log.Fatalf("数据库连接失败: %v", err)
	}
	log.Printf("数据库连接成功")

	// 自动迁移
	if err := db.AutoMigrate(
		&model.Project{},
		&model.O3ics{},
		&model.Rule{},
		&model.MusicTrack{},
		&model.ApiLog{},
		&model.LocalArtist{},
		&model.LocalAlbum{},
		&model.LocalSong{},
		&model.LocalPlaylist{},
		&model.LocalPlaylistSong{},
	); err != nil {
		log.Fatalf("数据库迁移失败: %v", err)
	}
	log.Println("数据库迁移完成")

	repo := repository.NewRepository(db)
	o3icsService := service.NewO3icsService(repo, cfg)

	// 初始化音乐库服务
	libraryService := library.NewLibraryService(repo, "./data")
	libHandler := library.NewHandler(libraryService, repo)

	h := handler.NewHandler(repo, o3icsService, cfg)

	gin.SetMode(cfg.Server.Mode)
	r := gin.New()

	r.Use(middleware.Logger())
	r.Use(middleware.Recovery())
	r.Use(middleware.CORS())
	r.Use(middleware.RequestID())

	r.GET("/health", h.HealthCheck)

	api := r.Group("/api/v1")
	{
		projects := api.Group("/projects")
		{
			projects.GET("", h.GetProjects)
			projects.POST("", h.CreateProject)
			projects.GET("/:id", h.GetProject)
			projects.PUT("/:id", h.UpdateProject)
			projects.DELETE("/:id", h.DeleteProject)
		}

		o3ics := api.Group("/o3ics")
		{
			o3ics.POST("/generate", h.GenerateO3ics)
			o3ics.GET("", h.GetO3icsList)
			o3ics.GET("/:id", h.GetO3ics)
			o3ics.PUT("/:id", h.UpdateO3ics)
			o3ics.DELETE("/:id", h.DeleteO3ics)
			o3ics.POST("/:id/favorite", h.ToggleFavorite)
		}

		rules := api.Group("/rules")
		{
			rules.GET("", h.GetRules)
			rules.POST("", h.CreateRule)
			rules.GET("/featured", h.GetFeaturedRules)
			rules.GET("/:id", h.GetRule)
			rules.PUT("/:id", h.UpdateRule)
			rules.DELETE("/:id", h.DeleteRule)
			rules.POST("/import", h.ImportRule)
			rules.GET("/export/:id", h.ExportRule)
		}

		musicTracks := api.Group("/music-tracks")
		{
			musicTracks.GET("", h.GetMusicTracksByO3ics)
			musicTracks.POST("", h.CreateMusicTrack)
			musicTracks.PUT("/:id", h.UpdateMusicTrack)
			musicTracks.DELETE("/:id", h.DeleteMusicTrack)
			musicTracks.GET("/by-task", h.GetMusicTrackByTaskId)
		}

		apiLogs := api.Group("/api-logs")
		{
			apiLogs.POST("", h.CreateApiLog)
			apiLogs.GET("", h.GetRecentApiLogs)
		}

		suno := api.Group("/suno")
		{
			suno.POST("/submit", h.SunoSubmit)
			suno.POST("/fetch", h.SunoFetch)
		}

		// 本地音乐库
		localSongs := api.Group("/local-songs")
		{
			localSongs.GET("", h.GetLocalSongs)
			localSongs.POST("", h.CreateLocalSong)
			localSongs.PUT("/:id", h.UpdateLocalSong)
			localSongs.DELETE("/:id", h.DeleteLocalSong)
			localSongs.POST("/:id/play", h.PlayLocalSong)
			localSongs.POST("/:id/favorite", h.ToggleLocalSongFavorite)
			localSongs.POST("/import", h.ImportSongs)
		}

		localArtists := api.Group("/local-artists")
		{
			localArtists.GET("", h.GetLocalArtists)
		}

		localAlbums := api.Group("/local-albums")
		{
			localAlbums.GET("", h.GetLocalAlbums)
		}

		localPlaylists := api.Group("/local-playlists")
		{
			localPlaylists.GET("", h.GetLocalPlaylists)
			localPlaylists.POST("", h.CreateLocalPlaylist)
			localPlaylists.DELETE("/:id", h.DeleteLocalPlaylist)
			localPlaylists.GET("/:id/songs", h.GetLocalPlaylistSongs)
			localPlaylists.POST("/:id/songs", h.AddSongToPlaylist)
			localPlaylists.DELETE("/:id/songs", h.RemoveSongFromPlaylist)
		}

		// 音乐库扫描 API
		library := api.Group("/library")
		{
			library.POST("/scan", libHandler.ScanLibrary)                    // 扫描并导入
			library.GET("/scan", libHandler.GetScanResult)                   // 预览扫描结果
			library.GET("/metadata", libHandler.GetAudioMetadata)             // 获取元数据
			library.GET("/stats", libHandler.GetStats)                       // 获取统计
			library.GET("/formats", libHandler.GetSupportedFormats)            // 获取支持的格式
		}

		api.GET("/options", h.GetOptions)
	}

	addr := fmt.Sprintf(":%s", cfg.Server.Port)
	log.Printf("服务器启动在 http://localhost%s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("服务器启动失败: %v", err)
	}
}
