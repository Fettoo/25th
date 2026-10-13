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
  ArrowDown
} from 'lucide-react';
import { YearData, MemoryPhoto, SongTrack } from '../types/index';
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
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-charcoal-muted block">
                    Judul Tema Babak
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

                {/* If Cipher Code Game */}
                {currentYear.miniGame.cipherData && (
                  <div className="p-3 rounded-xl bg-white border border-cream-200 space-y-2">
                    <span className="text-[10px] font-semibold tracking-wider text-rose-hover uppercase">
                      KODE PIN RAHASIA
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-charcoal-muted block mb-1">Target Angka PIN</label>
                        <input
                          type="text"
                          value={currentYear.miniGame.cipherData.targetCode}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateCurrentYear(y => ({
                              ...y,
                              miniGame: {
                                ...y.miniGame,
                                cipherData: y.miniGame.cipherData ? { ...y.miniGame.cipherData, targetCode: val } : undefined
                              }
                            }));
                          }}
                          className="w-full bg-cream-50 px-2.5 py-1.5 rounded-lg border border-cream-200 font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-charcoal-muted block mb-1">Petunjuk (Hint)</label>
                        <input
                          type="text"
                          value={currentYear.miniGame.cipherData.hint}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateCurrentYear(y => ({
                              ...y,
                              miniGame: {
                                ...y.miniGame,
                                cipherData: y.miniGame.cipherData ? { ...y.miniGame.cipherData, hint: val } : undefined
                              }
                            }));
                          }}
                          className="w-full bg-cream-50 px-2.5 py-1.5 rounded-lg border border-cream-200 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* If Word Unscramble Game */}
                {currentYear.miniGame.wordData && (
                  <div className="p-3 rounded-xl bg-white border border-cream-200 space-y-2">
                    <span className="text-[10px] font-semibold tracking-wider text-rose-hover uppercase">
                      KATA KUNCI RAHASIA
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-charcoal-muted block mb-1">Target Jawaban</label>
                        <input
                          type="text"
                          value={currentYear.miniGame.wordData.answer}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase();
                            updateCurrentYear(y => ({
                              ...y,
                              miniGame: {
                                ...y.miniGame,
                                wordData: y.miniGame.wordData ? {
                                  ...y.miniGame.wordData,
                                  answer: val,
                                  letters: val.split('')
                                } : undefined
                              }
                            }));
                          }}
                          className="w-full bg-cream-50 px-2.5 py-1.5 rounded-lg border border-cream-200 font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-charcoal-muted block mb-1">Petunjuk (Hint)</label>
                        <input
                          type="text"
                          value={currentYear.miniGame.wordData.hint}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateCurrentYear(y => ({
                              ...y,
                              miniGame: {
                                ...y.miniGame,
                                wordData: y.miniGame.wordData ? { ...y.miniGame.wordData, hint: val } : undefined
                              }
                            }));
                          }}
                          className="w-full bg-cream-50 px-2.5 py-1.5 rounded-lg border border-cream-200 text-xs"
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

