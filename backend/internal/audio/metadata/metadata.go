package metadata

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

// AudioMetadata 音频元数据
type AudioMetadata struct {
	// 基本信息
	Title    string `json:"title"`
	Artist   string `json:"artist"`
	Album    string `json:"album"`
	Genre    string `json:"genre"`
	Year     int    `json:"year"`
	Duration int    `json:"duration"` // 秒

	// 曲目信息
	TrackNumber int    `json:"track_number"`
	DiscNumber  int    `json:"disc_number"`

	// 文件信息
	CoverPath  string `json:"cover_path"`
	CoverData  string `json:"cover_data"` // base64 编码的封面
	FileSize   int64  `json:"file_size"`
	SampleRate int    `json:"sample_rate"`
	Bitrate    int    `json:"bitrate"` // kbps
	Channels   int    `json:"channels"`

	// 额外信息
	Composer    string `json:"composer"`
	Comment     string `json:"comment"`
	Lyrics      string `json:"lyrics"`
	Encoder     string `json:"encoder"`
	Copyright   string `json:"copyright"`
}

// Extractor 元数据提取器
type Extractor struct {
	coverDir string
}

// NewExtractor 创建提取器
func NewExtractor(coverDir string) *Extractor {
	return &Extractor{coverDir: coverDir}
}

// Extract 从音频文件提取元数据
func (e *Extractor) Extract(filePath string) (*AudioMetadata, error) {
	ext := strings.ToLower(filepath.Ext(filePath))

	switch ext {
	case ".mp3":
		return e.extractMP3(filePath)
	case ".flac":
		return e.extractFLAC(filePath)
	case ".ogg":
		return e.extractOGG(filePath)
	case ".m4a", ".aac":
		return e.extractM4A(filePath)
	case ".wav":
		return e.extractWAV(filePath)
	default:
		return e.extractGeneric(filePath)
	}
}

// extractGeneric 通用提取（仅文件信息）
func (e *Extractor) extractGeneric(filePath string) (*AudioMetadata, error) {
	info, err := os.Stat(filePath)
	if err != nil {
		return nil, err
	}

	metadata := &AudioMetadata{
		Title:   strings.TrimSuffix(filepath.Base(filePath), filepath.Ext(filePath)),
		FileSize: info.Size(),
	}

	// 解析文件名尝试获取信息 (格式: 歌手 - 歌曲名)
	metadata.Title = filepath.Base(filePath)
	parts := strings.Split(metadata.Title, " - ")
	if len(parts) >= 2 {
		metadata.Artist = strings.TrimSpace(parts[0])
		metadata.Title = strings.TrimSpace(strings.TrimSuffix(parts[1], filepath.Ext(filePath)))
	}

	return metadata, nil
}

// extractMP3 提取 MP3 元数据 (ID3v2)
func (e *Extractor) extractMP3(filePath string) (*AudioMetadata, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	metadata := &AudioMetadata{}
	info, _ := file.Stat()
	metadata.FileSize = info.Size()

	// 读取文件头
	header := make([]byte, 10)
	if _, err := file.Read(header); err != nil {
		return e.extractGeneric(filePath)
	}

	// 检查 ID3v2 标记
	if header[0] == 'I' && header[1] == 'D' && header[2] == '3' {
		// ID3v2.4 或 ID3v2.3
		size := int(header[6])<<21 | int(header[7])<<14 | int(header[8])<<7 | int(header[9])
		e.parseID3v2Frames(file, size, metadata)
	} else {
		// 没有 ID3v2，尝试通用解析
		metadata.Title = strings.TrimSuffix(filepath.Base(filePath), filepath.Ext(filePath))
	}

	return metadata, nil
}

// parseID3v2Frames 解析 ID3v2 帧
func (e *Extractor) parseID3v2Frames(file *os.File, size int, metadata *AudioMetadata) {
	frameHeaderSize := 10
	readBytes := 0

	for readBytes < size-10 {
		frameHeader := make([]byte, frameHeaderSize)
		n, _ := file.Read(frameHeader)
		if n < frameHeaderSize {
			break
		}
		readBytes += n

		// 检查帧标记
		frameID := string(frameHeader[0:4])
		if frameID[0] == 0 {
			break // 填充字节
		}

		// ID3v2.4: 4 字节大小
		// ID3v2.3: 4 字节大小（最后一个是旗标）
		frameSize := int(frameHeader[4])<<24 | int(frameHeader[5])<<16 | int(frameHeader[6])<<8 | int(frameHeader[7])

		if frameSize <= 0 || frameSize > 1024*1024 {
			break
		}

		frameData := make([]byte, frameSize)
		if n, _ := file.Read(frameData); n < frameSize {
			break
		}
		readBytes += n

		// 解析帧数据
		e.parseID3Frame(frameID, frameData, metadata)
	}
}

// parseID3Frame 解析单个 ID3 帧
func (e *Extractor) parseID3Frame(frameID string, data []byte, metadata *AudioMetadata) {
	switch frameID {
	case "TIT2": // 标题
		metadata.Title = e.decodeTextFrame(data)
	case "TPE1": // 艺术家
		metadata.Artist = e.decodeTextFrame(data)
	case "TALB": // 专辑
		metadata.Album = e.decodeTextFrame(data)
	case "TYER", "TDRC": // 年份
		yearStr := e.decodeTextFrame(data)
		if y, err := strconv.Atoi(yearStr); err == nil {
			metadata.Year = y
		}
	case "TCON": // 流派
		metadata.Genre = e.decodeTextFrame(data)
	case "TRCK", "TRK": // 曲目号
		trk := e.decodeTextFrame(data)
		if strings.Contains(trk, "/") {
			parts := strings.Split(trk, "/")
			trk = parts[0]
		}
		if n, err := strconv.Atoi(trk); err == nil {
			metadata.TrackNumber = n
		}
	case "TPOS": // 碟片号
		if n, err := strconv.Atoi(e.decodeTextFrame(data)); err == nil {
			metadata.DiscNumber = n
		}
	case "TCOM": // 作曲家
		metadata.Composer = e.decodeTextFrame(data)
	case "COMM": // 注释
		metadata.Comment = e.decodeTextFrame(data)
	case "TCOP": // 版权
		metadata.Copyright = e.decodeTextFrame(data)
	case "TSSE", "TENC": // 编码器
		metadata.Encoder = e.decodeTextFrame(data)
	case "APIC": // 封面
		e.extractCoverFromAPIC(data, metadata)
	case "USLT": // 歌词
		metadata.Lyrics = e.extractLyrics(data)
	}
}

// decodeTextFrame 解码文本帧
func (e *Extractor) decodeTextFrame(data []byte) string {
	if len(data) < 2 {
		return ""
	}

	encoding := data[0]
	text := data[1:]

	switch encoding {
	case 0: // ISO-8859-1
		return strings.Trim(string(text), "\x00")
	case 1: // UTF-16 with BOM
		return e.decodeUTF16(text)
	case 2: // UTF-16BE
		return e.decodeUTF16BE(text)
	case 3: // UTF-8
		return strings.Trim(string(text), "\x00")
	default:
		return strings.Trim(string(text), "\x00")
	}
}

// decodeUTF16 解码 UTF-16
func (e *Extractor) decodeUTF16(data []byte) string {
	// 跳过 BOM
	var bom []byte
	if len(data) >= 2 {
		if data[0] == 0xFF && data[1] == 0xFE {
			bom = data[2:]
		} else if data[0] == 0xFE && data[1] == 0xFF {
			bom = data[2:]
		}
	}

	if bom != nil {
		data = bom
	}

	// 转换为 rune 并解码
	runes := make([]rune, len(data)/2)
	for i := 0; i < len(runes); i++ {
		if len(data) >= i*2+1 {
			runes[i] = rune(data[i*2]) | rune(data[i*2+1])<<8
		}
	}

	return strings.Trim(string(runes), "\x00")
}

// decodeUTF16BE 解码 UTF-16BE
func (e *Extractor) decodeUTF16BE(data []byte) string {
	runes := make([]rune, len(data)/2)
	for i := 0; i < len(runes); i++ {
		if len(data) >= i*2+1 {
			runes[i] = rune(data[i*2])<<8 | rune(data[i*2+1])
		}
	}
	return strings.Trim(string(runes), "\x00")
}

// extractCoverFromAPIC 从 APIC 帧提取封面
func (e *Extractor) extractCoverFromAPIC(data []byte, metadata *AudioMetadata) {
	if len(data) < 4 {
		return
	}

	// 跳过描述部分（到 0x00）
	start := 1
	for i := start; i < len(data)-1; i++ {
		if data[i] == 0 && data[i+1] == 0 {
			start = i + 2
			break
		}
	}

	// 确定图片格式
	mimeStart := 0
	mimeEnd := start
	for mimeEnd < len(data) {
		if data[mimeEnd] == 0 {
			break
		}
		mimeEnd++
	}
	mime := string(data[mimeStart:mimeEnd])

	ext := ".jpg"
	switch mime {
	case "image/png":
		ext = ".png"
	case "image/gif":
		ext = ".gif"
	case "image/bmp":
		ext = ".bmp"
	}

	// 保存封面文件
	coverData := data[start:]
	if len(coverData) > 0 {
		// 生成封面文件名
		coverName := fmt.Sprintf("cover_%d%s", time.Now().UnixNano(), ext)
		coverPath := filepath.Join(e.coverDir, coverName)

		if err := os.WriteFile(coverPath, coverData, 0644); err == nil {
			metadata.CoverPath = coverPath
		}
	}
}

// extractLyrics 从 USLT 帧提取歌词
func (e *Extractor) extractLyrics(data []byte) string {
	if len(data) < 4 {
		return ""
	}

	// 跳过语言(3字节) + 描述终止符
	pos := 4
	for pos < len(data) && data[pos] != 0 {
		pos++
	}
	pos++ // 跳过终止符

	encoding := data[0]
	lyricsData := data[pos:]

	switch encoding {
	case 0, 3: // ISO-8859-1, UTF-8
		return strings.TrimSpace(string(lyricsData))
	default:
		return strings.TrimSpace(e.decodeUTF16(lyricsData))
	}
}

// extractFLAC 提取 FLAC 元数据 (简化实现)
func (e *Extractor) extractFLAC(filePath string) (*AudioMetadata, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	metadata := &AudioMetadata{}
	info, _ := file.Stat()
	metadata.FileSize = info.Size()

	// 检查 FLAC 标记 "fLaC"
	header := make([]byte, 4)
	if _, err := file.Read(header); err != nil || string(header) != "fLaC" {
		return e.extractGeneric(filePath)
	}

	// 读取元数据块
	for {
		blockHeader := make([]byte, 4)
		if _, err := file.Read(blockHeader); err != nil {
			break
		}

		isLast := (blockHeader[0] & 0x80) != 0
		blockType := blockHeader[0] & 0x7F
		blockSize := int(blockHeader[1])<<16 | int(blockHeader[2])<<8 | int(blockHeader[3])

		if blockSize > 1024*1024 {
			break
		}

		blockData := make([]byte, blockSize)
		if _, err := file.Read(blockData); err != nil {
			break
		}

		// Type 4 是 VORBIS_COMMENT
		if blockType == 4 {
			e.parseVorbisComment(blockData, metadata)
		} else if blockType == 6 { // 类型 6 是 PICTURE
			e.parseFLACPicture(blockData, metadata)
		}

		if isLast {
			break
		}
	}

	return metadata, nil
}

// parseVorbisComment 解析 Vorbis 注释
func (e *Extractor) parseVorbisComment(data []byte, metadata *AudioMetadata) {
	if len(data) < 4 {
		return
	}

	pos := 0

	// 跳过 vendor string
	vendorLen := int(data[0]) | int(data[1])<<8 | int(data[2])<<16 | int(data[3])<<24
	pos += 4 + vendorLen

	if pos >= len(data) {
		return
	}

	// 评论数量
	commentCount := int(data[pos]) | int(data[pos+1])<<8 | int(data[pos+2])<<16 | int(data[pos+3])<<24
	pos += 4

	for i := 0; i < commentCount && pos < len(data); i++ {
		commentLen := int(data[pos]) | int(data[pos+1])<<8 | int(data[pos+2])<<16 | int(data[pos+3])<<24
		pos += 4

		if pos+commentLen > len(data) {
			break
		}

		comment := string(data[pos : pos+commentLen])
		pos += commentLen

		// 解析 key=value 格式
		parts := bytes.SplitN([]byte(comment), []byte("="), 2)
		if len(parts) != 2 {
			continue
		}
		key := strings.ToUpper(string(parts[0]))
		value := string(parts[1])

		switch key {
		case "TITLE":
			metadata.Title = value
		case "ARTIST":
			metadata.Artist = value
		case "ALBUM":
			metadata.Album = value
		case "DATE", "YEAR":
			if y, err := strconv.Atoi(value[:min(4, len(value))]); err == nil {
				metadata.Year = y
			}
		case "GENRE":
			metadata.Genre = value
		case "TRACKNUMBER":
			if n, err := strconv.Atoi(value); err == nil {
				metadata.TrackNumber = n
			}
		case "DISCNUMBER":
			if n, err := strconv.Atoi(value); err == nil {
				metadata.DiscNumber = n
			}
		case "COMPOSER":
			metadata.Composer = value
		case "COMMENT":
			metadata.Comment = value
		case "COPYRIGHT":
			metadata.Copyright = value
		}
	}
}

// parseFLACPicture 解析 FLAC 封面
func (e *Extractor) parseFLACPicture(data []byte, metadata *AudioMetadata) {
	if len(data) < 32 {
		return
	}

	pos := 0

	// 图片类型 (4 bytes)
	pos += 4

	// MIME 类型长度
	mimeLen := int(data[pos])<<24 | int(data[pos+1])<<16 | int(data[pos+2])<<8 | int(data[pos+3])
	pos += 4 + mimeLen

	// 描述长度
	descLen := int(data[pos])<<24 | int(data[pos+1])<<16 | int(data[pos+2])<<8 | int(data[pos+3])
	pos += 4 + descLen

	// 宽度、高度、颜色深度、色板数 (各 4 bytes)
	pos += 16

	// 图片大小
	imgSize := int(data[pos])<<24 | int(data[pos+1])<<16 | int(data[pos+2])<<8 | int(data[pos+3])
	pos += 4

	if pos+imgSize > len(data) {
		return
	}

	// 保存封面
	coverName := fmt.Sprintf("cover_%d.jpg", time.Now().UnixNano())
	coverPath := filepath.Join(e.coverDir, coverName)

	if err := os.WriteFile(coverPath, data[pos:pos+imgSize], 0644); err == nil {
		metadata.CoverPath = coverPath
	}
}

// extractOGG 提取 OGG 元数据 (简化实现)
func (e *Extractor) extractOGG(filePath string) (*AudioMetadata, error) {
	return e.extractGeneric(filePath)
}

// extractM4A 提取 M4A/AAC 元数据 (简化实现)
func (e *Extractor) extractM4A(filePath string) (*AudioMetadata, error) {
	return e.extractGeneric(filePath)
}

// extractWAV 提取 WAV 元数据 (简化实现)
func (e *Extractor) extractWAV(filePath string) (*AudioMetadata, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	metadata := &AudioMetadata{}
	info, _ := file.Stat()
	metadata.FileSize = info.Size()

	// 读取 RIFF 头
	riff := make([]byte, 12)
	if _, err := file.Read(riff); err != nil || string(riff[0:4]) != "RIFF" {
		return e.extractGeneric(filePath)
	}

	// 读取 fmt chunk
	fmtChunk := make([]byte, 24)
	if _, err := file.Read(fmtChunk); err != nil {
		return e.extractGeneric(filePath)
	}

	if string(fmtChunk[0:4]) == "fmt " {
		// 采样率
		metadata.SampleRate = int(binary.LittleEndian.Uint32(fmtChunk[4:8]))
		// 声道数
		metadata.Channels = int(binary.LittleEndian.Uint16(fmtChunk[10:12]))
		// 比特率
		metadata.Bitrate = int(binary.LittleEndian.Uint32(fmtChunk[16:20])) / 1000
	}

	return metadata, nil
}
