package library

import (
	"backend/internal/audio/scanner"
	"backend/internal/model"
	"backend/internal/pkg/response"
	"backend/internal/repository"
	"fmt"
	"strconv"

	"github.com/gin-gonic/gin"
)

// Handler 音乐库处理器
type Handler struct {
	service *LibraryService
	repo    *repository.Repository
}

// NewHandler 创建处理器
func NewHandler(libService *LibraryService, repo *repository.Repository) *Handler {
	return &Handler{
		service: libService,
		repo:    repo,
	}
}

// ============ 扫描 API ============

// ScanLibrary 扫描音乐库目录
func (h *Handler) ScanLibrary(c *gin.Context) {
	var body struct {
		Path string `json:"path" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, 400, "缺少 path 参数")
		return
	}

	// 设置库路径
	h.service.SetLibraryPath(body.Path)

	// 执行扫描
	result, err := h.service.ScanLibrary(body.Path)
	if err != nil {
		response.Error(c, 500, "扫描失败: "+err.Error())
		return
	}

	response.Success(c, result)
}

// GetScanResult 获取扫描结果（不导入）
func (h *Handler) GetScanResult(c *gin.Context) {
	path := c.Query("path")
	if path == "" {
		response.Error(c, 400, "缺少 path 参数")
		return
	}

	// 设置库路径
	h.service.SetLibraryPath(path)

	// 只扫描不导入
	s := scanner.NewScanner(path)
	result, err := s.ScanDirectory()
	if err != nil {
		response.Error(c, 500, "扫描失败: "+err.Error())
		return
	}

	response.Success(c, result)
}

// ============ 元数据 API ============

// GetAudioMetadata 获取音频文件元数据
func (h *Handler) GetAudioMetadata(c *gin.Context) {
	filePath := c.Query("path")
	if filePath == "" {
		response.Error(c, 400, "缺少 path 参数")
		return
	}

	meta, err := h.service.GetAudioMetadata(filePath)
	if err != nil {
		response.Error(c, 500, "获取元数据失败: "+err.Error())
		return
	}

	response.Success(c, meta)
}

// ============ 统计 API ============

// GetStats 获取音乐库统计
func (h *Handler) GetStats(c *gin.Context) {
	stats, err := h.service.GetStats()
	if err != nil {
		response.Error(c, 500, "获取统计失败: "+err.Error())
		return
	}

	response.Success(c, stats)
}

// GetSupportedFormats 获取支持的音频格式
func (h *Handler) GetSupportedFormats(c *gin.Context) {
	formats := []map[string]interface{}{
		{"ext": ".mp3", "name": "MP3", "mime": "audio/mpeg", "supported": true},
		{"ext": ".flac", "name": "FLAC", "mime": "audio/flac", "supported": true},
		{"ext": ".wav", "name": "WAV", "mime": "audio/wav", "supported": true},
		{"ext": ".ogg", "name": "OGG", "mime": "audio/ogg", "supported": true},
		{"ext": ".m4a", "name": "M4A", "mime": "audio/mp4", "supported": true},
		{"ext": ".aac", "name": "AAC", "mime": "audio/aac", "supported": true},
		{"ext": ".opus", "name": "Opus", "mime": "audio/opus", "supported": true},
		{"ext": ".wma", "name": "WMA", "mime": "audio/x-ms-wma", "supported": false},
		{"ext": ".ape", "name": "APE", "mime": "audio/x-ape", "supported": false},
	}

	response.Success(c, gin.H{"formats": formats, "extensions": scanner.GetAudioExtensions()})
}

// ============ 歌曲管理 API (扩展) ============

// GetSongs 获取歌曲列表（支持更多筛选）
func (h *Handler) GetSongs(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "50"))
	artist := c.Query("artist")
	favorite := c.Query("favorite")
	search := c.Query("search")

	page, pageSize = repository.CalculatePagination(page, pageSize)

	var songs []model.LocalSong
	var total int64
	var err error

	if artist != "" {
		songs, total, err = h.repo.GetLocalSongsByArtist(artist, page, pageSize)
	} else if favorite == "true" {
		songs, total, err = h.repo.GetLocalSongs(page, pageSize)
		if err == nil {
			// 过滤收藏
			filtered := make([]model.LocalSong, 0)
			for _, s := range songs {
				if s.Favorite {
					filtered = append(filtered, s)
				}
			}
			songs = filtered
			total = int64(len(filtered))
		}
	} else if search != "" {
		// 搜索
		songs, total, err = h.repo.SearchLocalSongs(search, page, pageSize)
	} else {
		songs, total, err = h.repo.GetLocalSongs(page, pageSize)
	}

	if err != nil {
		response.Error(c, 500, "获取歌曲列表失败")
		return
	}

	response.Success(c, map[string]interface{}{
		"songs":    songs,
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
	})
}

// SearchSongs 搜索歌曲
func (h *Handler) SearchSongs(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		response.Error(c, 400, "缺少搜索关键词")
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "50"))

	page, pageSize = repository.CalculatePagination(page, pageSize)

	songs, total, err := h.repo.SearchLocalSongs(query, page, pageSize)
	if err != nil {
		response.Error(c, 500, "搜索失败")
		return
	}

	response.Success(c, map[string]interface{}{
		"songs": songs,
		"total": total,
		"page":  page,
		"query": query,
	})
}

// GetSong 获取单个歌曲
func (h *Handler) GetSong(c *gin.Context) {
	id := c.Param("id")
	song, err := h.repo.GetLocalSong(id)
	if err != nil {
		response.Error(c, 404, "歌曲不存在")
		return
	}

	response.Success(c, song)
}

// UpdateSong 更新歌曲信息
func (h *Handler) UpdateSong(c *gin.Context) {
	id := c.Param("id")
	var body struct {
		Title      string `json:"title"`
		ArtistName string `json:"artist_name"`
		AlbumName  string `json:"album_name"`
		Genre      string `json:"genre"`
		Year       int    `json:"year"`
		Lyrics     string `json:"lyrics"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, 400, "无效的请求数据")
		return
	}

	song, err := h.repo.GetLocalSong(id)
	if err != nil {
		response.Error(c, 404, "歌曲不存在")
		return
	}

	if body.Title != "" {
		song.Title = body.Title
	}
	if body.ArtistName != "" {
		song.ArtistName = body.ArtistName
	}
	if body.AlbumName != "" {
		song.AlbumName = body.AlbumName
	}
	if body.Genre != "" {
		song.Genre = body.Genre
	}
	if body.Year > 0 {
		song.Year = body.Year
	}
	if body.Lyrics != "" {
		song.Lrc = body.Lyrics
	}

	if err := h.repo.UpdateLocalSong(song); err != nil {
		response.Error(c, 500, "更新失败")
		return
	}

	response.SuccessWithMsg(c, "更新成功", song)
}

// DeleteSong 删除歌曲（仅从库中移除，不删除文件）
func (h *Handler) DeleteSong(c *gin.Context) {
	id := c.Param("id")
	if err := h.repo.DeleteLocalSong(id); err != nil {
		response.Error(c, 500, "删除失败")
		return
	}

	response.SuccessWithMsg(c, "删除成功", nil)
}

// ToggleFavorite 切换收藏状态
func (h *Handler) ToggleFavorite(c *gin.Context) {
	id := c.Param("id")
	fav, err := h.repo.ToggleLocalSongFavorite(id)
	if err != nil {
		response.Error(c, 500, "操作失败")
		return
	}

	response.Success(c, map[string]interface{}{"favorite": fav})
}

// PlaySong 播放歌曲（增加播放次数）
func (h *Handler) PlaySong(c *gin.Context) {
	id := c.Param("id")
	if err := h.repo.IncrementLocalSongPlayCount(id); err != nil {
		response.Error(c, 500, "更新播放次数失败")
		return
	}

	song, err := h.repo.GetLocalSong(id)
	if err != nil {
		response.Error(c, 404, "歌曲不存在")
		return
	}

	response.Success(c, song)
}

// GetRandomSongs 获取随机歌曲
func (h *Handler) GetRandomSongs(c *gin.Context) {
	count, _ := strconv.Atoi(c.DefaultQuery("count", "10"))
	if count <= 0 || count > 100 {
		count = 10
	}

	songs, err := h.repo.GetRandomLocalSongs(count)
	if err != nil {
		response.Error(c, 500, "获取失败")
		return
	}

	response.Success(c, map[string]interface{}{"songs": songs, "count": len(songs)})
}

// ============ 播放列表 API (扩展) ============

// GetPlaylists 获取播放列表
func (h *Handler) GetPlaylists(c *gin.Context) {
	playlists, err := h.repo.GetLocalPlaylists()
	if err != nil {
		response.Error(c, 500, "获取播放列表失败")
		return
	}

	// 补充每个播放列表的歌曲数量
	result := make([]map[string]interface{}, len(playlists))
	for i, p := range playlists {
		songs, _ := h.repo.GetLocalPlaylistSongs(p.ID)
		result[i] = map[string]interface{}{
			"id":          p.ID,
			"name":        p.Name,
			"description": p.Description,
			"cover_path":  p.CoverPath,
			"created_at":  p.CreatedAt,
			"song_count":  len(songs),
		}
	}

	response.Success(c, map[string]interface{}{"playlists": result})
}

// CreatePlaylist 创建播放列表
func (h *Handler) CreatePlaylist(c *gin.Context) {
	var body struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, 400, "无效的请求数据")
		return
	}

	playlist := model.LocalPlaylist{
		Name:        body.Name,
		Description: body.Description,
	}

	if err := h.repo.CreateLocalPlaylist(&playlist); err != nil {
		response.Error(c, 500, "创建播放列表失败")
		return
	}

	response.SuccessWithMsg(c, "创建成功", playlist)
}

// DeletePlaylist 删除播放列表
func (h *Handler) DeletePlaylist(c *gin.Context) {
	id := c.Param("id")
	if err := h.repo.DeleteLocalPlaylist(id); err != nil {
		response.Error(c, 500, "删除失败")
		return
	}

	response.SuccessWithMsg(c, "删除成功", nil)
}

// GetPlaylistSongs 获取播放列表歌曲
func (h *Handler) GetPlaylistSongs(c *gin.Context) {
	id := c.Param("id")
	songs, err := h.repo.GetLocalPlaylistSongs(id)
	if err != nil {
		response.Error(c, 500, "获取歌曲失败")
		return
	}

	response.Success(c, map[string]interface{}{"songs": songs})
}

// AddSongToPlaylist 添加歌曲到播放列表
func (h *Handler) AddSongToPlaylist(c *gin.Context) {
	id := c.Param("id")
	var body struct {
		SongID string `json:"song_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, 400, "无效的请求数据")
		return
	}

	if err := h.repo.AddSongToPlaylist(id, body.SongID); err != nil {
		response.Error(c, 500, "添加失败: "+err.Error())
		return
	}

	response.SuccessWithMsg(c, "添加成功", nil)
}

// RemoveSongFromPlaylist 从播放列表移除歌曲
func (h *Handler) RemoveSongFromPlaylist(c *gin.Context) {
	id := c.Param("id")
	var body struct {
		SongID string `json:"song_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, 400, "无效的请求数据")
		return
	}

	if err := h.repo.RemoveSongFromPlaylist(id, body.SongID); err != nil {
		response.Error(c, 500, "移除失败")
		return
	}

	response.SuccessWithMsg(c, "移除成功", nil)
}

// ============ 批量导入 API ============

// ImportSongs 批量导入歌曲
func (h *Handler) ImportSongs(c *gin.Context) {
	var songs []struct {
		Title      string `json:"title"`
		ArtistName string `json:"artist_name"`
		AlbumName  string `json:"album_name"`
		Genre      string `json:"genre"`
		Year       int    `json:"year"`
		Duration   int    `json:"duration"`
		AudioPath  string `json:"audio_path"`
		CoverPath  string `json:"cover_path"`
		Lyrics     string `json:"lyrics"`
		FileHash   string `json:"file_hash"`
	}
	if err := c.ShouldBindJSON(&songs); err != nil {
		response.Error(c, 400, "无效的请求数据")
		return
	}

	imported := 0
	skipped := 0
	errors := make([]string, 0)
	resultSongs := make([]model.LocalSong, 0)

	for _, s := range songs {
		// 检查是否已存在
		if s.FileHash != "" {
			existing, _ := h.repo.GetLocalSongByHash(s.FileHash)
			if existing != nil {
				skipped++
				resultSongs = append(resultSongs, *existing)
				continue
			}
		}

		song := model.LocalSong{
			Title:      s.Title,
			ArtistName: s.ArtistName,
			AlbumName:  s.AlbumName,
			Genre:      s.Genre,
			Year:       s.Year,
			Duration:   s.Duration,
			AudioPath:  s.AudioPath,
			CoverPath:  s.CoverPath,
			Lrc:        s.Lyrics,
			FileHash:   s.FileHash,
		}

		if err := h.repo.CreateLocalSong(&song); err != nil {
			errors = append(errors, fmt.Sprintf("导入 %s 失败: %v", s.Title, err))
			continue
		}

		imported++
		resultSongs = append(resultSongs, song)
	}

	response.Success(c, map[string]interface{}{
		"imported": imported,
		"skipped":  skipped,
		"total":    len(songs),
		"errors":   errors,
		"songs":    resultSongs,
	})
}

// BatchDelete 批量删除歌曲
func (h *Handler) BatchDelete(c *gin.Context) {
	var body struct {
		IDs []string `json:"ids" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, 400, "无效的请求数据")
		return
	}

	deleted := 0
	for _, id := range body.IDs {
		if err := h.repo.DeleteLocalSong(id); err == nil {
			deleted++
		}
	}

	response.Success(c, map[string]interface{}{
		"deleted": deleted,
		"total":   len(body.IDs),
	})
}
