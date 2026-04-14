package library

import (
	"backend/internal/audio/metadata"
	"backend/internal/audio/scanner"
	"backend/internal/model"
	"backend/internal/repository"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// LibraryService 本地音乐库服务
type LibraryService struct {
	repo      *repository.Repository
	scanner   *scanner.Scanner
	extractor *metadata.Extractor
	coverDir  string
}

// NewLibraryService 创建音乐库服务
func NewLibraryService(repo *repository.Repository, dataDir string) *LibraryService {
	coverDir := filepath.Join(dataDir, "covers")
	return &LibraryService{
		repo:      repo,
		scanner:   scanner.NewScanner(""),
		extractor: metadata.NewExtractor(coverDir),
		coverDir:  coverDir,
	}
}

// ScanResult 扫描结果
type ScanResult struct {
	Total    int                    `json:"total"`
	Scanned int                    `json:"scanned"`
	Imported int                   `json:"imported"`
	Skipped  int                   `json:"skipped"`
	Errors   []string               `json:"errors,omitempty"`
	Songs    []model.LocalSong     `json:"songs,omitempty"`
}

// ScanLibrary 扫描音乐库
func (s *LibraryService) ScanLibrary(rootPath string) (*ScanResult, error) {
	result := &ScanResult{}

	// 确保封面目录存在
	if err := mkdirAll(s.coverDir); err != nil {
		return nil, fmt.Errorf("创建封面目录失败: %v", err)
	}

	// 用新路径重新初始化 Scanner，确保路径参数生效
	s.scanner = scanner.NewScanner(rootPath)

	// 扫描文件
	scanResult, err := s.scanner.ScanDirectory()
	if err != nil {
		return nil, err
	}

	result.Total = scanResult.Total

	// 处理每个文件
	songs := make([]model.LocalSong, 0, len(scanResult.Files))
	errors := make([]string, 0)

	for _, file := range scanResult.Files {
		// 检查是否已存在
		existing, err := s.repo.GetLocalSongByHash(file.Hash)
		if err == nil && existing != nil {
			result.Skipped++
			songs = append(songs, *existing)
			continue
		}

		// 提取元数据
		meta, err := s.extractor.Extract(file.Path)
		if err != nil {
			errors = append(errors, fmt.Sprintf("提取元数据失败 %s: %v", file.Name, err))
			continue
		}

		// 创建歌曲记录
		song := model.LocalSong{
			Title:      s.coalesce(meta.Title, file.Name),
			ArtistName: meta.Artist,
			AlbumName:  meta.Album,
			Genre:      meta.Genre,
			Year:       meta.Year,
			Duration:   meta.Duration,
			AudioPath:  file.Path,
			CoverPath:  meta.CoverPath,
			Lrc:        meta.Lyrics,
			FileHash:   file.Hash,
		}

		// 设置相对路径
		relative, _ := filepath.Rel(filepath.Dir(rootPath), file.Path)
		if !strings.HasPrefix(relative, "..") {
			song.AudioPath = relative
		}

		// 保存到数据库
		if err := s.repo.CreateLocalSong(&song); err != nil {
			errors = append(errors, fmt.Sprintf("保存失败 %s: %v", file.Name, err))
			continue
		}

		result.Imported++
		songs = append(songs, song)
	}

	result.Scanned = len(songs)
	result.Errors = errors
	result.Songs = songs

	return result, nil
}

// GetAudioMetadata 获取音频元数据
func (s *LibraryService) GetAudioMetadata(filePath string) (*metadata.AudioMetadata, error) {
	return s.extractor.Extract(filePath)
}

// GetStats 获取音乐库统计信息
func (s *LibraryService) GetStats() (map[string]interface{}, error) {
	// 统计歌曲数量
	songs, total, err := s.repo.GetLocalSongs(1, 1)
	if err != nil {
		return nil, err
	}

	// 统计艺术家数量
	artists, err := s.repo.GetLocalArtists()
	if err != nil {
		return nil, err
	}

	// 统计专辑数量
	albums, err := s.repo.GetLocalAlbums()
	if err != nil {
		return nil, err
	}

	// 统计播放列表数量
	playlists, err := s.repo.GetLocalPlaylists()
	if err != nil {
		return nil, err
	}

	_ = songs // 避免未使用警告

	return map[string]interface{}{
		"total_songs":     total,
		"total_artists":   len(artists),
		"total_albums":    len(albums),
		"total_playlists": len(playlists),
		"disk_usage":      0, // TODO: 计算实际磁盘使用
	}, nil
}

// GetLibraryPath 获取音乐库根路径
func (s *LibraryService) GetLibraryPath() string {
	return s.scanner.RootDir
}

// SetLibraryPath 设置音乐库根路径
func (s *LibraryService) SetLibraryPath(path string) {
	s.scanner = scanner.NewScanner(path)
}

// coalesce 返回第一个非空字符串
func (s *LibraryService) coalesce(values ...string) string {
	for _, v := range values {
		if v != "" {
			return v
		}
	}
	return ""
}

// mkdirAll 创建目录
func mkdirAll(path string) error {
	return os.MkdirAll(path, 0755)
}
