import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Download, 
  RotateCcw, 
  Upload, 
  Plus, 
  Trash2, 
  Music, 
  Image as ImageIcon, 
  Feather, 
  KeyRound, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Eye,
  Film,
  GripVertical,
  ArrowUp,
  ArrowDown,
  CloudSun,
  Coffee,
  Heart,
  Star,
  Sparkles,
  Utensils,
  Lamp,
  BookOpen,
  MapPin,
  Gift,
  Sun,
  Moon,
  Compass,
  Camera
} from 'lucide-react';
import { YearData, MemoryPhoto, SongTrack, MiniGameType } from '../types/index';
import { 
  saveJournalData, 
  uploadMediaAsset, 
  exportJournalDataAsFile, 
  resetJournalDataToDefault 
} from '../data/journalData';
import { compressImageFile, formatFileSize } from '../utils/mediaCompressor';

interface StudioDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  journalData: YearData[];
  onDataUpdated: (newData: YearData[]) => void;
  isFullPage?: boolean;
}

type StudioTab = 'music' | 'photos' | 'wishes' | 'game';

const AVAILABLE_MATCH_ICONS = [
  { name: 'CloudSun', label: 'Senja / Cuaca' },
  { name: 'Coffee', label: 'Kopi / Minuman' },
  { name: 'Music', label: 'Musik / Nada' },
  { name: 'Heart', label: 'Hati / Sayang' },
  { name: 'Camera', label: 'Kamera / Foto' },
  { name: 'Star', label: 'Bintang' },
  { name: 'Sparkles', label: 'Kilau Momen' },
  { name: 'Utensils', label: 'Makan Berdua' },
  { name: 'Lamp', label: 'Lentera Malam' },
  { name: 'BookOpen', label: 'Buku / Cerita' },
  { name: 'MapPin', label: 'Lokasi / Perjalanan' },
  { name: 'Gift', label: 'Hadiah / Kado' },
  { name: 'Film', label: 'Sinema / Video' },
  { name: 'Sun', label: 'Matahari' },
  { name: 'Moon', label: 'Bulan' },
  { name: 'Compass', label: 'Kompas' },
];

const renderMatchIconPreview = (name: string, size = 16) => {
  switch (name) {
    case 'CloudSun': return <CloudSun size={size} strokeWidth={1.5} />;
    case 'Coffee': return <Coffee size={size} strokeWidth={1.5} />;
    case 'Music': return <Music size={size} strokeWidth={1.5} />;
    case 'Heart': return <Heart size={size} strokeWidth={1.5} />;
    case 'Camera': return <Camera size={size} strokeWidth={1.5} />;
    case 'Star': return <Star size={size} strokeWidth={1.5} />;
    case 'Utensils': return <Utensils size={size} strokeWidth={1.5} />;
    case 'Lamp': return <Lamp size={size} strokeWidth={1.5} />;
    case 'BookOpen': return <BookOpen size={size} strokeWidth={1.5} />;
    case 'MapPin': return <MapPin size={size} strokeWidth={1.5} />;
    case 'Gift': return <Gift size={size} strokeWidth={1.5} />;
    case 'Film': return <Film size={size} strokeWidth={1.5} />;
    case 'Sun': return <Sun size={size} strokeWidth={1.5} />;
    case 'Moon': return <Moon size={size} strokeWidth={1.5} />;
    case 'Compass': return <Compass size={size} strokeWidth={1.5} />;
    default: return <Sparkles size={size} strokeWidth={1.5} />;
  }
};

export const StudioDashboard: React.FC<StudioDashboardProps> = ({
  isOpen,
  onClose,
  journalData,
  onDataUpdated,
  isFullPage = false,
}) => {
  const [data, setData] = useState<YearData[]>(journalData);
  const [activeYearIndex, setActiveYearIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<StudioTab>('photos');
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedPhotoIndex, setDraggedPhotoIndex] = useState<number | null>(null);
  const [dragOverPhotoIndex, setDragOverPhotoIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const currentYear = data[activeYearIndex] || data[0];

  // Helper to update current year's data in the state
  const updateCurrentYear = (updater: (prev: YearData) => YearData) => {
    setData(prev => {
      const updated = [...prev];
      updated[activeYearIndex] = updater(updated[activeYearIndex]);
      return updated;
    });
  };

  // Reorder photos handler
  const handleReorderPhotos = (sourceIndex: number, destinationIndex: number) => {
    if (sourceIndex === destinationIndex) return;
    updateCurrentYear(year => {
      const updatedPhotos = [...year.photos];
      const [movedItem] = updatedPhotos.splice(sourceIndex, 1);
      updatedPhotos.splice(destinationIndex, 0, movedItem);
      return { ...year, photos: updatedPhotos };
    });
  };

  const handleMovePhotoUp = (index: number) => {
    if (index > 0) {
      handleReorderPhotos(index, index - 1);
    }
  };

  const handleMovePhotoDown = (index: number) => {
    if (index < currentYear.photos.length - 1) {
      handleReorderPhotos(index, index + 1);
    }
  };

  // Preview Audio Test
  const handleTogglePreviewAudio = (audioUrl: string) => {
    if (previewAudio) {
      previewAudio.pause();
      if (isPlayingPreview) {
        setIsPlayingPreview(false);
        return;
      }
    }

    try {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlayingPreview(false);
      audio.onerror = () => {
        setIsPlayingPreview(false);
        setSaveStatus({
          message: 'Berkas audio belum ditemukan di URL tersebut. Harap pastikan berkas MP3 telah diunggah.',
          type: 'error'
        });
      };
      audio.play().then(() => {
        setPreviewAudio(audio);
        setIsPlayingPreview(true);
      }).catch(() => {
        setIsPlayingPreview(false);
      });
    } catch {
      setIsPlayingPreview(false);
    }
  };

  // Upload Photo or Video handler with automatic compression
  const handleUploadMedia = async (e: React.ChangeEvent<HTMLInputElement>, photoIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideoFile = file.type.startsWith('video/') || Boolean(file.name.match(/\.(mp4|webm|ogg|mov)$/i));

    try {
      let fileToUpload = file;
      let compressionInfo = '';

      if (!isVideoFile) {
        setSaveStatus({ message: `Sedang mengoptimasi & mengompresi foto ${file.name}...`, type: 'info' });
        const result = await compressImageFile(file);
        fileToUpload = result.file;
        if (result.reductionPercentage > 0) {
          compressionInfo = ` (${formatFileSize(result.originalSize)} -> ${formatFileSize(result.compressedSize)}, hemat ${result.reductionPercentage}%)`;
        }
      } else {
        setSaveStatus({ message: `Sedang memproses video ${file.name} (${formatFileSize(file.size)})...`, type: 'info' });
      }

      const targetMediaType = isVideoFile ? 'video' : 'photo';
      const uploadRes = await uploadMediaAsset(fileToUpload, targetMediaType);

      updateCurrentYear(year => {
        const photos = [...year.photos];
        if (photoIndex !== undefined && photos[photoIndex]) {
          photos[photoIndex] = {
            ...photos[photoIndex],
            imageUrl: uploadRes.url,
            mediaType: isVideoFile ? 'video' : 'image'
          };
        } else {
          // Add new photo or video
          const newPhoto: MemoryPhoto = {
            id: `${year.year}-${String(photos.length + 1).padStart(2, '0')}`,
            title: file.name.replace(/\.[^/.]+$/, ''),
            date: `Tahun ${year.year}`,
            caption: 'Kenangan manis yang terekam indah.',
            location: 'Lokasi Kenangan',
            imageUrl: uploadRes.url,
            mediaType: isVideoFile ? 'video' : 'image'
          };
          photos.push(newPhoto);
        }
        return { ...year, photos };
      });

      setSaveStatus({
        message: uploadRes.isLocalFile 
          ? `${isVideoFile ? 'Video' : 'Foto'} ${file.name} berhasil disimpan ke public/${isVideoFile ? 'videos' : 'photos'}${compressionInfo}` 
          : `${isVideoFile ? 'Video' : 'Foto'} ${file.name} berhasil dimuat sebagai data media${compressionInfo}`,
        type: 'success'
      });
    } catch {
      setSaveStatus({ message: `Gagal memproses ${isVideoFile ? 'video' : 'foto'}. Silakan coba lagi.`, type: 'error' });
    }
  };

  // Upload Audio handler
  const handleUploadAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSaveStatus({ message: `Sedang mengunggah berkas audio ${file.name}...`, type: 'info' });
      const uploadRes = await uploadMediaAsset(file, 'audio');

      updateCurrentYear(year => ({
        ...year,
        song: {
          ...year.song,
          title: file.name.replace(/\.[^/.]+$/, ''),
          fileName: file.name,
          audioUrl: uploadRes.url
        }
      }));

      setSaveStatus({
        message: uploadRes.isLocalFile 
          ? `Lagu ${file.name} berhasil disimpan ke public/audio` 
          : `Lagu ${file.name} berhasil dimuat ke audio URL`,
        type: 'success'
      });
    } catch {
      setSaveStatus({ message: 'Gagal mengunggah audio. Silakan coba lagi.', type: 'error' });
    }
  };

  // Add empty photo card
  const handleAddPhotoCard = () => {
    updateCurrentYear(year => ({
      ...year,
      photos: [
        ...year.photos,
        {
          id: `${year.year}-${String(year.photos.length + 1).padStart(2, '0')}`,
          title: 'Judul Foto Kenangan',
          date: `Bulan ${year.year}`,
          caption: 'Tuliskan cerita singkat atau kesan di balik foto ini.',
          location: 'Nama Tempat',
          imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80'
        }
      ]
    }));
  };

  // Remove photo card
  const handleRemovePhoto = (index: number) => {
    updateCurrentYear(year => {
      const photos = year.photos.filter((_, i) => i !== index);
      return { ...year, photos };
    });
  };

  // Save all changes
  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveStatus({ message: 'Menyimpan perubahan...', type: 'info' });
    
    const result = await saveJournalData(data);
    onDataUpdated(data);
    setIsSaving(false);

    setSaveStatus({
      message: result.savedToDisk 
        ? 'Perubahan berhasil disimpan permanen ke berkas proyek (src/data/journalData.json) dan browser.' 
        : 'Perubahan tersimpan di penyimpanan browser lokal.',
      type: 'success'
    });
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (window.confirm('Apakah kamu yakin ingin mengembalikan seluruh data kenangan ke setelan awal pabrikan?')) {
      const defaultData = resetJournalDataToDefault();
      setData(defaultData);
      onDataUpdated(defaultData);
      setSaveStatus({ message: 'Data telah dikembalikan ke setelan awal.', type: 'info' });
    }
  };

  // Export JSON file
  const handleExportFile = () => {
    exportJournalDataAsFile(data);
    setSaveStatus({ message: 'Berkas cadangan JSON berhasil diunduh.', type: 'success' });
  };

  const wrapperClass = isFullPage 
    ? "min-h-dvh bg-cream-50 paper-grain text-charcoal py-4 px-2 sm:px-4 flex items-center justify-center" 
    : "fixed inset-0 z-50 bg-charcoal/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4";

  const cardClass = isFullPage
    ? "bg-cream-50 w-full max-w-[640px] min-h-[90dvh] rounded-card shadow-float flex flex-col border border-cream-200 overflow-hidden text-charcoal"
    : "bg-cream-50 w-full max-w-[560px] max-h-[92dvh] rounded-card shadow-float flex flex-col border border-cream-200 overflow-hidden text-charcoal";

  return (
    <div className={wrapperClass}>
      <div className={cardClass}>
        
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-cream-200 flex items-center justify-between bg-cream-100/70">
          <div>
            <div className="flex items-center gap-1.5 text-rose-hover">
              <FileText size={14} strokeWidth={1.5} />
              <span className="text-[10px] uppercase tracking-[0.25em] font-semibold">
                STUDIO PENGATURAN KENANGAN
              </span>
            </div>
            <h2 className="font-serif text-lg font-medium text-charcoal mt-0.5">
              Kelola Foto, Audio & Surat
            </h2>
          </div>

          {isFullPage ? (
            <button
              onClick={() => {
                if (previewAudio) previewAudio.pause();
                onClose();
              }}
              className="px-3 py-1.5 rounded-full bg-cream-50 hover:bg-cream-200/60 border border-cream-200 text-charcoal text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye size={13} strokeWidth={1.5} />
              <span>Lihat Jurnal</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (previewAudio) previewAudio.pause();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-cream-50 hover:bg-cream-200/60 border border-cream-200 flex items-center justify-center text-charcoal-muted transition-colors cursor-pointer"
              aria-label="Tutup Studio"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Year Selector Pills */}
        <div className="px-4 py-2.5 bg-cream-50 border-b border-cream-200/80 overflow-x-auto no-scrollbar flex items-center gap-1.5">
          {data.map((y, idx) => (
            <button
              key={y.year}
              onClick={() => setActiveYearIndex(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer whitespace-nowrap border ${
                activeYearIndex === idx
                  ? 'bg-rose-accent text-white border-rose-accent shadow-xs'
                  : 'bg-cream-100 text-charcoal-muted border-cream-200 hover:bg-cream-200/50'
              }`}
            >
              {y.year}
            </button>
          ))}
        </div>

        {/* Section Tabs */}
        <div className="px-4 py-2 border-b border-cream-200/60 flex items-center justify-between gap-1 text-xs">
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'photos'
                ? 'bg-rose-soft text-rose-hover font-semibold'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <ImageIcon size={14} strokeWidth={1.5} />
            <span>Foto ({currentYear.photos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('music')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'music'
                ? 'bg-rose-soft text-rose-hover font-semibold'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <Music size={14} strokeWidth={1.5} />
            <span>Soundtrack</span>
          </button>

          <button
            onClick={() => setActiveTab('wishes')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'wishes'
                ? 'bg-rose-soft text-rose-hover font-semibold'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <Feather size={14} strokeWidth={1.5} />
            <span>Pesan & Wish</span>
          </button>

          <button
            onClick={() => setActiveTab('game')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'game'
                ? 'bg-rose-soft text-rose-hover font-semibold'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <KeyRound size={14} strokeWidth={1.5} />
            <span>Kunci Babak</span>
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Status Message / Alert */}
          {saveStatus && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
              saveStatus.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : saveStatus.type === 'error'
                ? 'bg-rose-soft text-rose-900 border-rose-300'
                : 'bg-cream-100 text-charcoal border-cream-200'
            }`}>
              {saveStatus.type === 'success' && <CheckCircle2 size={14} strokeWidth={1.5} className="flex-shrink-0" />}
              {saveStatus.type === 'error' && <AlertCircle size={14} strokeWidth={1.5} className="flex-shrink-0" />}
              <span>{saveStatus.message}</span>
            </div>
          )}

          {/* Header Informasi Babak Tahun: Chapter, Title, & Subtitle */}
          <div className="p-3.5 rounded-2xl bg-cream-100/90 border border-cream-200/90 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-rose-hover font-semibold text-xs">
                <Sparkles size={13} strokeWidth={1.5} className="text-rose-accent" />
                <span className="uppercase tracking-wider">JUDUL & SUBJUDUL TAHUN {currentYear.year}</span>
              </div>
              <span className="text-[10px] font-mono text-charcoal-subtle bg-white/90 px-2 py-0.5 rounded border border-cream-200">
                Tampil di bagian paling atas jurnal
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-1">
                <label className="text-[10px] font-medium text-charcoal-muted block mb-1">
                  Babak (Chapter)
                </label>
                <input
                  type="text"
                  value={currentYear.chapter}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateCurrentYear(y => ({ ...y, chapter: val }));
                  }}
                  placeholder="CHAPTER 01"
                  className="w-full bg-white px-2.5 py-1.5 rounded-xl border border-cream-200 text-xs font-mono font-semibold text-rose-hover shadow-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-medium text-charcoal-muted block mb-1">
                  Judul Utama Tahun (Title)
                </label>
                <input
                  type="text"
                  value={currentYear.title}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateCurrentYear(y => ({ ...y, title: val }));
                  }}
                  placeholder="Contoh: Dalam Jarak dan Doa"
                  className="w-full bg-white px-3 py-1.5 rounded-xl border border-cream-200 text-sm font-serif font-medium text-charcoal shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-medium text-charcoal-muted block mb-1">
                Subjudul Kenangan (Subtitle)
              </label>
              <input
                type="text"
                value={currentYear.subtitle}
                onChange={(e) => {
                  const val = e.target.value;
                  updateCurrentYear(y => ({ ...y, subtitle: val }));
                }}
                placeholder="Contoh: Dunia melambat, namun rasa kita tumbuh semakin tabah"
                className="w-full bg-white px-3 py-1.5 rounded-xl border border-cream-200 text-xs text-charcoal-muted leading-relaxed shadow-xs"
              />
            </div>
          </div>

          {/* ----------------- TAB: FOTO KENANGAN ----------------- */}
          {activeTab === 'photos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-base font-medium">
                    Galeri Foto & Video Tahun {currentYear.year}
                  </h3>
                  <p className="text-[11px] text-charcoal-muted">
                    Tahan dan geser (drag & drop) atau gunakan tombol panah untuk mengubah urutan tampil di jurnal.
                  </p>
                </div>
                <button
                  onClick={handleAddPhotoCard}
                  className="px-3 py-1.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-charcoal text-xs font-medium flex items-center gap-1.5 border border-cream-200 cursor-pointer"
                >
                  <Plus size={13} strokeWidth={1.5} />
                  <span>Tambah Foto/Video</span>
                </button>
              </div>

              {currentYear.photos.map((photo, pIdx) => {
                const isItemVideo = photo.mediaType === 'video' ||
                  Boolean(photo.imageUrl && photo.imageUrl.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) ||
                  Boolean(photo.imageUrl && photo.imageUrl.startsWith('data:video/'));

                return (
                  <div 
                    key={photo.id || pIdx}
                    draggable
                    onDragStart={(e) => {
                      setDraggedPhotoIndex(pIdx);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (dragOverPhotoIndex !== pIdx) {
                        setDragOverPhotoIndex(pIdx);
                      }
                    }}
                    onDragLeave={() => {
                      if (dragOverPhotoIndex === pIdx) {
                        setDragOverPhotoIndex(null);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedPhotoIndex !== null && draggedPhotoIndex !== pIdx) {
                        handleReorderPhotos(draggedPhotoIndex, pIdx);
                      }
                      setDraggedPhotoIndex(null);
                      setDragOverPhotoIndex(null);
                    }}
                    onDragEnd={() => {
                      setDraggedPhotoIndex(null);
                      setDragOverPhotoIndex(null);
                    }}
                    className={`p-3.5 rounded-2xl bg-cream-100/70 border space-y-3 transition-all duration-200 ${
                      dragOverPhotoIndex === pIdx 
                        ? 'border-rose-accent bg-rose-soft/40 shadow-sm' 
                        : 'border-cream-200'
                    } ${draggedPhotoIndex === pIdx ? 'opacity-40 scale-[0.99]' : 'opacity-100'}`}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Drag Grip Handle & Index */}
                      <div 
                        className="flex flex-col items-center justify-center gap-1 text-charcoal-subtle cursor-grab active:cursor-grabbing self-stretch py-1 select-none pr-1"
                        title="Tahan dan geser untuk mengubah urutan"
                      >
                        <GripVertical size={16} strokeWidth={1.5} />
                        <span className="text-[10px] font-mono font-semibold">#{pIdx + 1}</span>
                      </div>

                      {/* Thumbnail preview */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-cream-200 flex-shrink-0 relative border border-cream-200 flex items-center justify-center">
                        {isItemVideo ? (
                          <video 
                            src={photo.imageUrl} 
                            className="w-full h-full object-cover" 
                            muted 
                          />
                        ) : (
                          <img 
                            src={photo.imageUrl} 
                            alt={photo.title}
                            className="w-full h-full object-cover" 
                          />
                        )}
                        <span className="absolute bottom-1 right-1 text-[9px] font-mono uppercase bg-charcoal/70 text-white px-1 py-0.5 rounded flex items-center gap-0.5">
                          {isItemVideo ? <Film size={9} strokeWidth={1.5} /> : <ImageIcon size={9} strokeWidth={1.5} />}
                          <span>{isItemVideo ? 'VID' : 'IMG'}</span>
                        </span>
                      </div>

                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <input
                            type="text"
                            value={photo.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateCurrentYear(y => {
                                const ph = [...y.photos];
                                ph[pIdx].title = val;
                                return { ...y, photos: ph };
                              });
                            }}
                            placeholder="Judul Media"
                            className="font-serif text-sm font-medium bg-white px-2 py-1 rounded-lg border border-cream-200 w-full"
                          />
                          
                          {/* Reorder and Delete Actions */}
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMovePhotoUp(pIdx)}
                              disabled={pIdx === 0}
                              title="Pindah ke atas"
                              className="p-1 rounded hover:bg-cream-200/80 disabled:opacity-20 disabled:cursor-not-allowed text-charcoal transition-colors cursor-pointer"
                            >
                              <ArrowUp size={13} strokeWidth={1.5} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMovePhotoDown(pIdx)}
                              disabled={pIdx === currentYear.photos.length - 1}
                              title="Pindah ke bawah"
                              className="p-1 rounded hover:bg-cream-200/80 disabled:opacity-20 disabled:cursor-not-allowed text-charcoal transition-colors cursor-pointer"
                            >
                              <ArrowDown size={13} strokeWidth={1.5} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(pIdx)}
                              className="text-rose-hover hover:text-rose-700 p-1 cursor-pointer transition-colors"
                              title="Hapus media ini"
                            >
                              <Trash2 size={15} strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <input
                            type="text"
                            value={photo.date}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateCurrentYear(y => {
                                const ph = [...y.photos];
                                ph[pIdx].date = val;
                                return { ...y, photos: ph };
                              });
                            }}
                            placeholder="Bulan / Tanggal"
                            className="bg-white px-2 py-1 rounded-lg border border-cream-200 text-[11px] font-mono"
                          />
                          <input
                            type="text"
                            value={photo.location || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateCurrentYear(y => {
                                const ph = [...y.photos];
                                ph[pIdx].location = val;
                                return { ...y, photos: ph };
                              });
                            }}
                            placeholder="Lokasi"
                            className="bg-white px-2 py-1 rounded-lg border border-cream-200 text-[11px]"
                          />
                          <select
                            value={photo.mediaType || (isItemVideo ? 'video' : 'image')}
                            onChange={(e) => {
                              const val = e.target.value as 'image' | 'video';
                              updateCurrentYear(y => {
                                const ph = [...y.photos];
                                ph[pIdx].mediaType = val;
                                return { ...y, photos: ph };
                              });
                            }}
                            className="bg-white px-2 py-1 rounded-lg border border-cream-200 text-[11px] cursor-pointer"
                          >
                            <option value="image">Foto</option>
                            <option value="video">Video</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Caption & URL */}
                    <div className="space-y-1.5 text-xs">
                      <textarea
                        value={photo.caption}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateCurrentYear(y => {
                            const ph = [...y.photos];
                            ph[pIdx].caption = val;
                            return { ...y, photos: ph };
                          });
                        }}
                        placeholder="Keterangan / Cerita di balik momen ini..."
                        rows={2}
                        className="w-full bg-white px-2.5 py-1.5 rounded-lg border border-cream-200 text-xs leading-relaxed"
                      />

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={photo.imageUrl}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateCurrentYear(y => {
                              const ph = [...y.photos];
                              ph[pIdx].imageUrl = val;
                              return { ...y, photos: ph };
                            });
                          }}
                          placeholder="URL Foto / Video atau ./photos/... atau ./videos/..."
                          className="flex-1 bg-white px-2 py-1 rounded-lg border border-cream-200 text-[11px] font-mono"
                        />

                        <label className="px-2.5 py-1 rounded-lg bg-rose-accent hover:bg-rose-hover text-white text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors flex-shrink-0">
                          <Upload size={12} strokeWidth={1.5} />
                          <span>Unggah</span>
                          <input
                            type="file"
                            accept="image/*,video/*"
                            className="hidden"
                            onChange={(e) => handleUploadMedia(e, pIdx)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ----------------- TAB: SOUNDTRACK ----------------- */}
          {activeTab === 'music' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-base font-medium">
                  Soundtrack Tahun {currentYear.year}
                </h3>
                <p className="text-[11px] text-charcoal-muted">
                  Musik latar yang diputar otomatis saat babak tahun {currentYear.year} dibuka.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-cream-100/70 border border-cream-200 space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-charcoal-muted block">
                    Judul Lagu
                  </label>
                  <input
                    type="text"
                    value={currentYear.song.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateCurrentYear(y => ({
                        ...y,
                        song: { ...y.song, title: val }
                      }));
                    }}
                    placeholder="Judul Lagu Kenangan"
                    className="w-full bg-white px-3 py-1.5 rounded-xl border border-cream-200 text-sm font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-charcoal-muted block">
                      Nama Berkas Audio
                    </label>
                    <input
                      type="text"
                      value={currentYear.song.fileName}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCurrentYear(y => ({
                          ...y,
                          song: { ...y.song, fileName: val }
                        }));
                      }}
                      placeholder="contoh: 2018.mp3"
                      className="w-full bg-white px-3 py-1.5 rounded-xl border border-cream-200 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-charcoal-muted block">
                      Artis / Penyanyi
                    </label>
                    <input
                      type="text"
                      value={currentYear.song.artist}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCurrentYear(y => ({
                          ...y,
                          song: { ...y.song, artist: val }
                        }));
                      }}
                      placeholder="Nama Artis"
                      className="w-full bg-white px-3 py-1.5 rounded-xl border border-cream-200 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-charcoal-muted block">
                    Sumber URL Audio atau Unggah Berkas MP3
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={currentYear.song.audioUrl}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCurrentYear(y => ({
                          ...y,
                          song: { ...y.song, audioUrl: val }
                        }));
                      }}
                      placeholder="./audio/2018.mp3"
                      className="flex-1 bg-white px-3 py-1.5 rounded-xl border border-cream-200 text-xs font-mono"
                    />

                    <label className="px-3 py-1.5 rounded-xl bg-rose-accent hover:bg-rose-hover text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors flex-shrink-0">
                      <Upload size={13} strokeWidth={1.5} />
                      <span>Unggah MP3</span>
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={handleUploadAudio}
                      />
                    </label>
                  </div>
                </div>

                {/* Synth Mood Dropdown */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-charcoal-muted block">
                    Mood Synthesizer Cadangan (Jika Berkas MP3 Belum Ada)
                  </label>
                  <select
                    value={currentYear.song.synthTheme}
                    onChange={(e) => {
                      const val = e.target.value as SongTrack['synthTheme'];
                      updateCurrentYear(y => ({
                        ...y,
                        song: { ...y.song, synthTheme: val }
                      }));
                    }}
                    className="w-full bg-white px-3 py-1.5 rounded-xl border border-cream-200 text-xs font-medium cursor-pointer"
                  >
                    <option value="nostalgic">Nostalgic (Cmaj7 - Am7)</option>
                    <option value="gentle">Gentle (Dmaj7 - Bm7)</option>
                    <option value="deep">Deep (Am7 - Fmaj7)</option>
                    <option value="warm">Warm (Fmaj7 - Cmaj7)</option>
                    <option value="dreamy">Dreamy (Emaj7 - C#m7)</option>
                    <option value="hopeful">Hopeful (C - G - Am)</option>
                    <option value="joyful">Joyful (D - A - Bm)</option>
                    <option value="radiant">Radiant (Fmaj7 - Em7)</option>
                    <option value="celebration">Celebration (C - Em - F - G)</option>
                  </select>
                </div>

                {/* Preview Button */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-charcoal-subtle font-mono">
                    Uji pemutaran audio:
                  </span>
                  <button
                    onClick={() => handleTogglePreviewAudio(currentYear.song.audioUrl)}
                    className="px-3 py-1.5 rounded-xl bg-cream-50 hover:bg-cream-200/60 border border-cream-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {isPlayingPreview ? (
                      <>
                        <Pause size={13} strokeWidth={1.5} />
                        <span>Hentikan Audio</span>
                      </>
                    ) : (
                      <>
                        <Play size={13} strokeWidth={1.5} />
                        <span>Putar Pratinjau</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ----------------- TAB: PESAN & WISH ----------------- */}
          {activeTab === 'wishes' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-base font-medium">
                  Surat & Doa Tahun {currentYear.year}
                </h3>
                <p className="text-[11px] text-charcoal-muted">
                  Kata-kata penuh makna yang dipersembahkan untuk Sophie.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-cream-100/70 border border-cream-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pb-2 border-b border-cream-200">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-charcoal-muted block">
                      Judul Utama Tahun (Title)
                    </label>
                    <input
                      type="text"
                      value={currentYear.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCurrentYear(y => ({ ...y, title: val }));
                      }}
                      placeholder="Contoh: Dalam Jarak dan Doa"
                      className="w-full bg-white px-3 py-1.5 rounded-xl border border-cream-200 text-sm font-serif font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-charcoal-muted block">
                      Subjudul Kenangan (Subtitle)
                    </label>
                    <input
                      type="text"
                      value={currentYear.subtitle}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCurrentYear(y => ({ ...y, subtitle: val }));
                      }}
                      placeholder="Contoh: Dunia melambat, namun rasa kita tumbuh semakin tabah"
                      className="w-full bg-white px-3 py-1.5 rounded-xl border border-cream-200 text-xs font-normal"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-charcoal-muted block">
                    Judul Tema Babak (Theme Title)
                  </label>
                  <input
                    type="text"
                    value={currentYear.wish.themeTitle}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateCurrentYear(y => ({
                        ...y,
                        wish: { ...y.wish, themeTitle: val }
                      }));
                    }}
                    placeholder="Judul Tema"
                    className="w-full bg-white px-3 py-1.5 rounded-xl border border-cream-200 text-sm font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-charcoal-muted block">
                    Catatan Dedikasi / Penulis
                  </label>
                  <input
                    type="text"
                    value={currentYear.wish.authorNote}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateCurrentYear(y => ({
                        ...y,
                        wish: { ...y.wish, authorNote: val }
                      }));
                    }}
                    placeholder="Ditulis dengan penuh kehangatan"
                    className="w-full bg-white px-3 py-1.5 rounded-xl border border-cream-200 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-charcoal-muted block">
                    Pesan Singkat (Langsung Tampil di Kartu)
                  </label>
                  <textarea
                    value={currentYear.wish.shortWish}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateCurrentYear(y => ({
                        ...y,
                        wish: { ...y.wish, shortWish: val }
                      }));
                    }}
                    placeholder="Pesan singkat..."
                    rows={2}
                    className="w-full bg-white px-3 py-2 rounded-xl border border-cream-200 text-xs italic font-serif leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-charcoal-muted block">
                    Pesan Panjang Naratif (Terbuka dengan [ BACA SELENGKAPNYA ])
                  </label>
                  <textarea
                    value={currentYear.wish.longWish}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateCurrentYear(y => ({
                        ...y,
                        wish: { ...y.wish, longWish: val }
                      }));
                    }}
                    placeholder="Tuliskan ungkapan perasaan yang panjang dan mendalam..."
                    rows={5}
                    className="w-full bg-white px-3 py-2 rounded-xl border border-cream-200 text-xs leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ----------------- TAB: KUNCI MINI-GAME ----------------- */}
          {activeTab === 'game' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-base font-medium">
                  Pengaturan Tantangan Kunci Tahun {currentYear.year}
                </h3>
                <p className="text-[11px] text-charcoal-muted">
                  Mini-game yang harus diselesaikan untuk membuka babak tahun berikutnya.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-cream-100/70 border border-cream-200 space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-charcoal-muted block">
                    Judul Tantangan
                  </label>
                  <input
                    type="text"
                    value={currentYear.miniGame.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateCurrentYear(y => ({
                        ...y,
                        miniGame: { ...y.miniGame, title: val }
                      }));
                    }}
                    className="w-full bg-white px-3 py-1.5 rounded-xl border border-cream-200 text-sm font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-charcoal-muted block">
                    Instruksi Tantangan
                  </label>
                  <textarea
                    value={currentYear.miniGame.instructions}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateCurrentYear(y => ({
                        ...y,
                        miniGame: { ...y.miniGame, instructions: val }
                      }));
                    }}
                    rows={2}
                    className="w-full bg-white px-3 py-2 rounded-xl border border-cream-200 text-xs leading-relaxed"
                  />
                </div>

                {/* Tipe Tantangan Babak */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-charcoal-muted block">
                    Tipe Tantangan Babak
                  </label>
                  <select
                    value={currentYear.miniGame.type}
                    onChange={(e) => {
                      const newType = e.target.value as MiniGameType;
                      updateCurrentYear(y => {
                        const mg = { ...y.miniGame, type: newType };

                        if (newType === 'memory-match' && (!mg.matchData || mg.matchData.length === 0)) {
                          mg.matchData = [
                            { id: 1, label: 'Senja Basah', iconName: 'CloudSun' },
                            { id: 2, label: 'Kopi Favorit', iconName: 'Coffee' },
                            { id: 3, label: 'Lagu Rahasia', iconName: 'Music' }
                          ];
                        }

                        if (newType === 'quiz' && (!mg.quizData || mg.quizData.length === 0)) {
                          mg.quizData = [{
                            question: `Pertanyaan kenangan tentang tahun ${y.year}...`,
                            options: ['Pilihan Jawaban A', 'Pilihan Jawaban B', 'Pilihan Jawaban C', 'Pilihan Jawaban D'],
                            correctIndex: 0,
                            hint: 'Petunjuk singkat untuk menjawab...'
                          }];
                        }

                        if (newType === 'cipher-code' && !mg.cipherData) {
                          mg.cipherData = {
                            targetCode: '180620',
                            prompt: 'Masukkan hingga 6 digit PIN kenangan',
                            hint: 'Tanggal atau angka momen spesial'
                          };
                        }

                        if (newType === 'word-unscramble' && !mg.wordData) {
                          mg.wordData = {
                            answer: 'CINTA',
                            letters: ['C', 'I', 'N', 'T', 'A'],
                            hint: 'Satu kata yang merangkum semua rasa'
                          };
                        }

                        if (newType === 'final-celebration' && !mg.finalData) {
                          mg.finalData = {
                            title: 'Sophie Grisella Olivia 25th Milestone',
                            dedication: 'Didedikasikan untuk wanita paling istimewa',
                            letterLines: [
                              'Delapan tahun perjalanan telah terangkum indah dalam lembaran ini.',
                              'Selamat Ulang Tahun ke-25, Sophie Grisella Olivia.'
                            ]
                          };
                        }

                        return { ...y, miniGame: mg };
                      });
                    }}
                    className="w-full bg-white px-3 py-1.5 rounded-xl border border-cream-200 text-xs font-medium cursor-pointer"
                  >
                    <option value="quiz">Kuis Pertanyaan (Tanya Jawab)</option>
                    <option value="memory-match">Kartu Pasangan Memori (Cocokkan Simbol)</option>
                    <option value="word-unscramble">Susun Kata Kunci Rahasia</option>
                    <option value="cipher-code">Kode PIN Rahasia</option>
                    <option value="final-celebration">Kapsul Kenangan Akhir</option>
                  </select>
                </div>

                {/* 1. Quiz Questions & Answers Editor */}
                {currentYear.miniGame.type === 'quiz' && (
                  <div className="space-y-3 pt-2 border-t border-cream-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold tracking-wider text-rose-hover uppercase">
                        DAFTAR SOAL & PILIHAN JAWABAN KUIS ({currentYear.miniGame.quizData?.length || 0})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          updateCurrentYear(y => {
                            const currentQuiz = y.miniGame.quizData ? [...y.miniGame.quizData] : [];
                            currentQuiz.push({
                              question: 'Pertanyaan baru tentang kenangan kita...',
                              options: [
                                'Pilihan Jawaban A',
                                'Pilihan Jawaban B',
                                'Pilihan Jawaban C',
                                'Pilihan Jawaban D'
                              ],
                              correctIndex: 0,
                              hint: 'Petunjuk singkat untuk menjawab...'
                            });
                            return {
                              ...y,
                              miniGame: { ...y.miniGame, quizData: currentQuiz }
                            };
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-cream-50 hover:bg-cream-200 border border-cream-200 text-charcoal text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus size={12} strokeWidth={1.5} />
                        <span>Tambah Soal</span>
                      </button>
                    </div>

                    {currentYear.miniGame.quizData?.map((qItem, qIdx) => (
                      <div key={qIdx} className="p-3.5 rounded-xl bg-white border border-cream-200 space-y-2.5 shadow-xs">
                        {/* Question Header & Delete */}
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-semibold text-charcoal">
                            SOAL #{qIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              updateCurrentYear(y => {
                                const currentQuiz = y.miniGame.quizData?.filter((_, idx) => idx !== qIdx);
                                return {
                                  ...y,
                                  miniGame: { ...y.miniGame, quizData: currentQuiz }
                                };
                              });
                            }}
                            className="text-rose-hover hover:text-rose-700 p-0.5 cursor-pointer transition-colors"
                            title="Hapus soal ini"
                          >
                            <Trash2 size={13} strokeWidth={1.5} />
                          </button>
                        </div>

                        {/* Question Text */}
                        <div>
                          <label className="text-[10px] text-charcoal-muted block mb-0.5">Teks Pertanyaan</label>
                          <textarea
                            value={qItem.question}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateCurrentYear(y => {
                                const currentQuiz = [...(y.miniGame.quizData || [])];
                                currentQuiz[qIdx] = { ...currentQuiz[qIdx], question: val };
                                return { ...y, miniGame: { ...y.miniGame, quizData: currentQuiz } };
                              });
                            }}
                            rows={2}
                            placeholder="Tuliskan pertanyaan kenangan..."
                            className="w-full bg-cream-50 px-2.5 py-1.5 rounded-lg border border-cream-200 text-xs leading-relaxed"
                          />
                        </div>

                        {/* Answer Options A, B, C, D */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-charcoal-muted block">
                            Pilihan Jawaban (Klik huruf A/B/C/D untuk menentukan Kunci Jawaban Benar)
                          </label>
                          {qItem.options.map((opt, optIdx) => {
                            const isCorrect = qItem.correctIndex === optIdx;
                            const optionLetters = ['A', 'B', 'C', 'D'];
                            return (
                              <div key={optIdx} className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateCurrentYear(y => {
                                      const currentQuiz = [...(y.miniGame.quizData || [])];
                                      currentQuiz[qIdx] = { ...currentQuiz[qIdx], correctIndex: optIdx };
                                      return { ...y, miniGame: { ...y.miniGame, quizData: currentQuiz } };
                                    });
                                  }}
                                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-semibold flex-shrink-0 cursor-pointer border transition-all ${
                                    isCorrect 
                                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' 
                                      : 'bg-cream-100 border-cream-200 text-charcoal-muted hover:border-emerald-400'
                                  }`}
                                  title={isCorrect ? 'Ini adalah kunci jawaban benar' : 'Klik untuk jadikan kunci jawaban benar'}
                                >
                                  {optionLetters[optIdx]}
                                </button>

                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    updateCurrentYear(y => {
                                      const currentQuiz = [...(y.miniGame.quizData || [])];
                                      const newOptions = [...currentQuiz[qIdx].options];
                                      newOptions[optIdx] = val;
                                      currentQuiz[qIdx] = { ...currentQuiz[qIdx], options: newOptions };
                                      return { ...y, miniGame: { ...y.miniGame, quizData: currentQuiz } };
                                    });
                                  }}
                                  placeholder={`Pilihan ${optionLetters[optIdx]}`}
                                  className={`flex-1 px-2.5 py-1 rounded-lg border text-xs ${
                                    isCorrect ? 'border-emerald-300 bg-emerald-50/50 text-emerald-950 font-medium' : 'border-cream-200 bg-cream-50'
                                  }`}
                                />
                                {isCorrect && (
                                  <span className="text-[9px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                    BENAR
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Hint */}
                        <div>
                          <label className="text-[10px] text-charcoal-muted block mb-0.5">Petunjuk Jika Salah (Hint)</label>
                          <input
                            type="text"
                            value={qItem.hint}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateCurrentYear(y => {
                                const currentQuiz = [...(y.miniGame.quizData || [])];
                                currentQuiz[qIdx] = { ...currentQuiz[qIdx], hint: val };
                                return { ...y, miniGame: { ...y.miniGame, quizData: currentQuiz } };
                              });
                            }}
                            placeholder="Petunjuk bantuan..."
                            className="w-full bg-cream-50 px-2.5 py-1.5 rounded-lg border border-cream-200 text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. Memory Match Cards Editor (Tantangan Kartu Pasang) */}
                {currentYear.miniGame.type === 'memory-match' && (
                  <div className="space-y-3 pt-2 border-t border-cream-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-semibold tracking-wider text-rose-hover uppercase block">
                          KARTU PASANGAN MEMORI ({currentYear.miniGame.matchData?.length || 0} PASANG)
                        </span>
                        <span className="text-[10px] text-charcoal-muted">
                          Ubah teks label kartu dan simbol ikon yang harus dicocokkan pemain
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          updateCurrentYear(y => {
                            const currentMatch = y.miniGame.matchData ? [...y.miniGame.matchData] : [];
                            const nextId = currentMatch.length > 0 ? Math.max(...currentMatch.map(m => m.id)) + 1 : 1;
                            currentMatch.push({
                              id: nextId,
                              label: 'Kenangan Baru',
                              iconName: 'Heart'
                            });
                            return {
                              ...y,
                              miniGame: { ...y.miniGame, matchData: currentMatch }
                            };
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-cream-50 hover:bg-cream-200 border border-cream-200 text-charcoal text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus size={12} strokeWidth={1.5} />
                        <span>Tambah Pasangan</span>
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {currentYear.miniGame.matchData?.map((item, idx) => (
                        <div key={item.id || idx} className="p-3.5 rounded-xl bg-white border border-cream-200 space-y-2.5 shadow-xs">
                          {/* Card Header & Delete */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cream-100 text-charcoal">
                                PASANGAN #{idx + 1}
                              </span>
                              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-accent text-[11px]">
                                {renderMatchIconPreview(item.iconName, 13)}
                                <span className="font-medium text-charcoal text-[11px] truncate max-w-[150px]">
                                  {item.label || 'Tanpa Label'}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                updateCurrentYear(y => {
                                  const currentMatch = y.miniGame.matchData?.filter((_, mIdx) => mIdx !== idx);
                                  return {
                                    ...y,
                                    miniGame: { ...y.miniGame, matchData: currentMatch }
                                  };
                                });
                              }}
                              className="text-rose-hover hover:text-rose-700 p-0.5 cursor-pointer transition-colors"
                              title="Hapus pasangan kartu ini"
                            >
                              <Trash2 size={13} strokeWidth={1.5} />
                            </button>
                          </div>

                          {/* Inputs: Label & Select Icon */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div>
                              <label className="text-[10px] text-charcoal-muted block mb-1">
                                Teks Label Kartu
                              </label>
                              <input
                                type="text"
                                value={item.label}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateCurrentYear(y => {
                                    const currentMatch = [...(y.miniGame.matchData || [])];
                                    currentMatch[idx] = { ...currentMatch[idx], label: val };
                                    return { ...y, miniGame: { ...y.miniGame, matchData: currentMatch } };
                                  });
                                }}
                                placeholder="Contoh: Senja Basah, Kopi Favorit..."
                                className="w-full bg-cream-50 px-2.5 py-1.5 rounded-lg border border-cream-200 text-xs font-medium"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] text-charcoal-muted block mb-1">
                                Pilihan Simbol Ikon
                              </label>
                              <select
                                value={item.iconName}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateCurrentYear(y => {
                                    const currentMatch = [...(y.miniGame.matchData || [])];
                                    currentMatch[idx] = { ...currentMatch[idx], iconName: val };
                                    return { ...y, miniGame: { ...y.miniGame, matchData: currentMatch } };
                                  });
                                }}
                                className="w-full bg-cream-50 px-2.5 py-1.5 rounded-lg border border-cream-200 text-xs font-medium cursor-pointer"
                              >
                                {AVAILABLE_MATCH_ICONS.map((opt) => (
                                  <option key={opt.name} value={opt.name}>
                                    {opt.label} ({opt.name})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Quick Icon Selector Chips */}
                          <div>
                            <label className="text-[9px] text-charcoal-subtle block mb-1">
                              Klik Cepat Simbol:
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                              {AVAILABLE_MATCH_ICONS.map((opt) => {
                                const isSelected = item.iconName === opt.name;
                                return (
                                  <button
                                    key={opt.name}
                                    type="button"
                                    onClick={() => {
                                      updateCurrentYear(y => {
                                        const currentMatch = [...(y.miniGame.matchData || [])];
                                        currentMatch[idx] = { ...currentMatch[idx], iconName: opt.name };
                                        return { ...y, miniGame: { ...y.miniGame, matchData: currentMatch } };
                                      });
                                    }}
                                    title={opt.label}
                                    className={`p-1.5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                                      isSelected
                                        ? 'bg-rose-accent text-white border-rose-accent shadow-xs'
                                        : 'bg-cream-50 hover:bg-cream-100 border-cream-200 text-charcoal-muted'
                                    }`}
                                  >
                                    {renderMatchIconPreview(opt.name, 14)}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Cipher Code Game */}
                {currentYear.miniGame.type === 'cipher-code' && (
                  <div className="p-3.5 rounded-xl bg-white border border-cream-200 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold tracking-wider text-rose-hover uppercase">
                        KODE PIN RAHASIA (MAKSIMAL 6 DIGIT)
                      </span>
                      <span className="text-[10px] text-charcoal-muted">
                        Pemain harus memasukkan angka PIN (hingga 6 digit) untuk membuka tahun berikutnya
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-charcoal-muted block mb-1">
                          Target Angka PIN (Maksimal 6 Digit Angka)
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={currentYear.miniGame.cipherData?.targetCode || ''}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                            updateCurrentYear(y => ({
                              ...y,
                              miniGame: {
                                ...y.miniGame,
                                cipherData: {
                                  prompt: y.miniGame.cipherData?.prompt || `Masukkan ${val.length || 6} digit PIN kenangan`,
                                  hint: y.miniGame.cipherData?.hint || 'Tanggal atau angka momen spesial',
                                  ...y.miniGame.cipherData,
                                  targetCode: val
                                }
                              }
                            }));
                          }}
                          placeholder="Contoh: 180620 (1 - 6 digit)"
                          className="w-full bg-cream-50 px-2.5 py-1.5 rounded-lg border border-cream-200 font-mono text-sm tracking-widest font-semibold"
                        />
                        <span className="text-[9px] text-charcoal-subtle mt-1 block font-mono">
                          Panjang PIN saat ini: {(currentYear.miniGame.cipherData?.targetCode || '').length}/6 digit (bisa 4, 5, atau 6 digit)
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] text-charcoal-muted block mb-1">
                            Instruksi Layar Pemain (Prompt)
                          </label>
                          <input
                            type="text"
                            value={currentYear.miniGame.cipherData?.prompt || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateCurrentYear(y => ({
                                ...y,
                                miniGame: {
                                  ...y.miniGame,
                                  cipherData: {
                                    targetCode: y.miniGame.cipherData?.targetCode || '180620',
                                    hint: y.miniGame.cipherData?.hint || 'Momen spesial',
                                    ...y.miniGame.cipherData,
                                    prompt: val
                                  }
                                }
                              }));
                            }}
                            placeholder="Contoh: Masukkan 6 digit tanggal jadian kita..."
                            className="w-full bg-cream-50 px-2.5 py-1.5 rounded-lg border border-cream-200 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-charcoal-muted block mb-1">
                            Petunjuk Bantuan Jika Salah (Hint)
                          </label>
                          <input
                            type="text"
                            value={currentYear.miniGame.cipherData?.hint || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateCurrentYear(y => ({
                                ...y,
                                miniGame: {
                                  ...y.miniGame,
                                  cipherData: {
                                    prompt: y.miniGame.cipherData?.prompt || 'Masukkan PIN kenangan',
                                    targetCode: y.miniGame.cipherData?.targetCode || '180620',
                                    ...y.miniGame.cipherData,
                                    hint: val
                                  }
                                }
                              }));
                            }}
                            placeholder="Petunjuk jika lupa PIN..."
                            className="w-full bg-cream-50 px-2.5 py-1.5 rounded-lg border border-cream-200 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Word Unscramble Game */}
                {currentYear.miniGame.type === 'word-unscramble' && (
                  <div className="p-3.5 rounded-xl bg-white border border-cream-200 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold tracking-wider text-rose-hover uppercase">
                        KATA KUNCI RAHASIA (SUSUN KATA)
                      </span>
                      <span className="text-[10px] text-charcoal-muted">
                        Huruf kata ini akan diacak dan pemain harus menyusunnya dengan benar
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-charcoal-muted block mb-1">Target Kata Jawaban (Huruf Kapital)</label>
                        <input
                          type="text"
                          value={currentYear.miniGame.wordData?.answer || ''}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase();
                            updateCurrentYear(y => ({
                              ...y,
                              miniGame: {
                                ...y.miniGame,
                                wordData: {
                                  hint: y.miniGame.wordData?.hint || 'Kata kenangan spesial',
                                  ...y.miniGame.wordData,
                                  answer: val,
                                  letters: val.split('')
                                }
                              }
                            }));
                          }}
                          placeholder="Contoh: CINTA, JANJI..."
                          className="w-full bg-cream-50 px-2.5 py-1.5 rounded-lg border border-cream-200 font-mono text-sm tracking-wider"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-charcoal-muted block mb-1">Petunjuk Bantuan (Hint)</label>
                        <input
                          type="text"
                          value={currentYear.miniGame.wordData?.hint || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateCurrentYear(y => ({
                              ...y,
                              miniGame: {
                                ...y.miniGame,
                                wordData: {
                                  answer: y.miniGame.wordData?.answer || 'CINTA',
                                  letters: (y.miniGame.wordData?.answer || 'CINTA').split(''),
                                  ...y.miniGame.wordData,
                                  hint: val
                                }
                              }
                            }));
                          }}
                          placeholder="Petunjuk kata..."
                          className="w-full bg-cream-50 px-2.5 py-1.5 rounded-lg border border-cream-200 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Final Celebration Dedication Editor */}
                {currentYear.miniGame.type === 'final-celebration' && (
                  <div className="p-3.5 rounded-xl bg-white border border-cream-200 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold tracking-wider text-rose-hover uppercase">
                        KAPSUL KENANGAN AKHIR (DEDIKASI)
                      </span>
                      <span className="text-[10px] text-charcoal-muted">
                        Pesan penutup perayaan 25 tahun yang tampil di babak puncak
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="text-[10px] text-charcoal-muted block mb-1">Judul Kapsul Kenangan</label>
                        <input
                          type="text"
                          value={currentYear.miniGame.finalData?.title || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateCurrentYear(y => ({
                              ...y,
                              miniGame: {
                                ...y.miniGame,
                                finalData: {
                                  dedication: y.miniGame.finalData?.dedication || '',
                                  letterLines: y.miniGame.finalData?.letterLines || [],
                                  ...y.miniGame.finalData,
                                  title: val
                                }
                              }
                            }));
                          }}
                          placeholder="Sophie Grisella Olivia 25th Milestone"
                          className="w-full bg-cream-50 px-2.5 py-1.5 rounded-lg border border-cream-200 text-xs font-medium"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-charcoal-muted block mb-1">Dedikasi / Subjudul</label>
                        <input
                          type="text"
                          value={currentYear.miniGame.finalData?.dedication || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateCurrentYear(y => ({
                              ...y,
                              miniGame: {
                                ...y.miniGame,
                                finalData: {
                                  title: y.miniGame.finalData?.title || '',
                                  letterLines: y.miniGame.finalData?.letterLines || [],
                                  ...y.miniGame.finalData,
                                  dedication: val
                                }
                              }
                            }));
                          }}
                          placeholder="Didedikasikan untuk wanita paling istimewa"
                          className="w-full bg-cream-50 px-2.5 py-1.5 rounded-lg border border-cream-200 text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-charcoal-muted block mb-1">
                          Baris Surat Penutup (Pisahkan tiap baris dengan baris baru / Enter)
                        </label>
                        <textarea
                          value={(currentYear.miniGame.finalData?.letterLines || []).join('\n')}
                          onChange={(e) => {
                            const lines = e.target.value.split('\n');
                            updateCurrentYear(y => ({
                              ...y,
                              miniGame: {
                                ...y.miniGame,
                                finalData: {
                                  title: y.miniGame.finalData?.title || 'Sophie Grisella Olivia 25th Milestone',
                                  dedication: y.miniGame.finalData?.dedication || '',
                                  ...y.miniGame.finalData,
                                  letterLines: lines
                                }
                              }
                            }));
                          }}
                          rows={4}
                          placeholder="Tulis kalimat-kalimat surat penutup..."
                          className="w-full bg-cream-50 px-2.5 py-1.5 rounded-lg border border-cream-200 text-xs leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Bottom Actions Bar */}
        <div className="px-5 py-3.5 border-t border-cream-200 bg-cream-100/80 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportFile}
              className="px-3 py-2 rounded-xl bg-cream-50 hover:bg-cream-200/60 border border-cream-200 text-xs font-medium text-charcoal flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Unduh berkas JSON sebagai cadangan"
            >
              <Download size={13} strokeWidth={1.5} />
              <span className="hidden sm:inline">Unduh Backup JSON</span>
            </button>

            <button
              onClick={handleResetToDefault}
              className="px-2.5 py-2 rounded-xl bg-cream-50 hover:bg-cream-200/60 border border-cream-200 text-xs font-medium text-charcoal-muted hover:text-charcoal flex items-center gap-1 cursor-pointer transition-colors"
              title="Reset ke setelan awal pabrikan"
            >
              <RotateCcw size={13} strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (previewAudio) previewAudio.pause();
                onClose();
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-charcoal-muted hover:text-charcoal cursor-pointer"
            >
              Batal
            </button>

            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-rose-accent hover:bg-rose-hover text-white text-xs font-medium tracking-wider uppercase flex items-center gap-2 shadow-soft transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Save size={14} strokeWidth={1.5} />
              <span>{isSaving ? 'Menyimpan...' : 'SIMPAN KE PROYEK'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

