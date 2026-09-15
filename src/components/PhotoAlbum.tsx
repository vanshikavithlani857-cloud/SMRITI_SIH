import React, { useState } from 'react';
import { 
  Images, 
  Upload, 
  Plus, 
  Volume2, 
  Heart, 
  Check, 
  Trash2, 
  Sparkles, 
  User,
  ArrowLeft,
  Languages
} from 'lucide-react';
import { Language, MemoryPhoto, UserRole } from '../types';
import { translations } from '../i18n/translations';
import { getBhashiniI18n } from '../i18n/bhashiniTranslations';
import { 
  translatePhotoWithBhashini, 
  BHASHINI_PHOTO_PRESETS, 
  BHASHINI_RELATIONS,
  BhashiniPreset 
} from '../services/bhashiniService';
import { playGentleTap, speakText } from '../utils/audio';

interface PhotoAlbumProps {
  language: Language;
  currentRole: UserRole;
  photos: MemoryPhoto[];
  onAddPhoto: (photo: Omit<MemoryPhoto, 'id' | 'dateAdded'>) => void;
  onDeletePhoto?: (id: string) => void;
  onSetFeatured?: (id: string) => void;
  onBackToHome: () => void;
}

export const PhotoAlbum: React.FC<PhotoAlbumProps> = ({
  language,
  currentRole,
  photos,
  onAddPhoto,
  onDeletePhoto,
  onSetFeatured,
  onBackToHome,
}) => {
  const t = translations[language];
  const bt = getBhashiniI18n(language);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [title, setTitle] = useState('');
  const [relation, setRelation] = useState('');
  const [memoryNote, setMemoryNote] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [featured, setFeatured] = useState(true);
  const [isReadingPhotoId, setIsReadingPhotoId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState(false);

  // File Upload Reader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (preset: BhashiniPreset) => {
    playGentleTap();
    const loc = preset.translations[language] || preset.translations.en;
    setTitle(loc.title);
    setRelation(loc.relation);
    setMemoryNote(loc.note);
    setPhotoUrl(preset.url);
  };

  const handleSubmitPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !photoUrl.trim()) return;

    playGentleTap();
    onAddPhoto({
      title: title.trim(),
      relation: relation.trim() || (language === 'hi' ? 'परिवार' : 'Family'),
      memoryNote: memoryNote.trim() || (language === 'hi' ? 'स्नेह और आनंद से भरा पारिवारिक पल।' : 'A beautiful family moment filled with love and warmth.'),
      url: photoUrl.trim(),
      addedBy: currentRole === 'caregiver' ? 'Caregiver (Sahayak)' : 'Family',
      featuredInDashboard: featured,
    });

    // Reset
    setTitle('');
    setRelation('');
    setMemoryNote('');
    setPhotoUrl('');
    setShowUploadModal(false);

    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 4000);
  };

  const handleSpeakMemory = (photo: MemoryPhoto) => {
    playGentleTap();
    setIsReadingPhotoId(photo.id);

    const bhashini = translatePhotoWithBhashini(photo, language);

    speakText(bhashini.spokenNarration, language, () => {
      setIsReadingPhotoId(null);
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-2.5 sm:px-4 py-2 sm:py-3 space-y-2.5 sm:space-y-3 pb-8 animate-in fade-in duration-200">
      
      {/* Top Banner (North Eastern Eri Silk & Assam Emerald Highlight) */}
      <div className="bg-[#064E3B] text-white rounded-2xl px-4 py-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-2 border-[#043628]">
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={() => {
              playGentleTap();
              onBackToHome();
            }}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer shrink-0 border border-white/20"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-black tracking-tight truncate flex items-center space-x-2">
              <Heart className="w-5 h-5 text-amber-300 fill-amber-300/40" />
              <span>{t.memoriesPhotos}</span>
            </h1>
            <p className="text-xs text-emerald-100 truncate font-medium">
              🌿 {bt.bhashiniTranslateTip}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {/* Bhashini Corpus Badge */}
          <span className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1 bg-white/15 text-emerald-100 rounded-xl text-xs font-bold border border-white/20">
            <Languages className="w-3.5 h-3.5 text-amber-300" />
            <span>{bt.bhashiniBadge}</span>
          </span>

          <button
            id="open-upload-photo-modal-btn"
            onClick={() => {
              playGentleTap();
              setShowUploadModal(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl text-xs sm:text-sm font-black shadow-xs transition-colors cursor-pointer border border-amber-600"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t.uploadPhotoBtn}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successToast && (
        <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-400 text-emerald-950 flex items-center space-x-2.5 shadow-xs animate-fade-in">
          <Check className="w-4 h-4 text-emerald-700 shrink-0 stroke-[3]" />
          <p className="text-xs sm:text-sm font-black">
            {t.photoUploadedSuccess}
          </p>
        </div>
      )}

      {/* Photos Grid with Bhashini Indic Translation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {photos.map((photo) => {
          const isReading = isReadingPhotoId === photo.id;
          const bhashini = translatePhotoWithBhashini(photo, language);

          return (
            <div
              key={photo.id}
              className="bg-[#FAF7F0] rounded-2xl overflow-hidden border-2 border-[#E0D7C6] shadow-xs hover:shadow-md transition-all flex flex-col group"
            >
              {/* Image with Tag Overlay */}
              <div className="relative aspect-16/10 w-full bg-stone-100 overflow-hidden">
                <img
                  src={photo.url}
                  alt={bhashini.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
                
                {/* Kinship / Relation Tag (Localized in current language) */}
                <div className="absolute top-2.5 left-2.5 bg-stone-900/90 backdrop-blur-xs text-amber-300 text-[11px] font-black px-2.5 py-1 rounded-lg flex items-center space-x-1 shadow-xs border border-white/15">
                  <User className="w-3.5 h-3.5 text-amber-300" />
                  <span>{bhashini.relation}</span>
                </div>

                {photo.featuredInDashboard && (
                  <div className="absolute top-2.5 right-2.5 bg-amber-500 text-stone-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg shadow-xs border border-amber-600">
                    {bt.featuredMemory}
                  </div>
                )}
              </div>

              {/* Memory Details */}
              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-stone-900 leading-tight line-clamp-1">
                    {bhashini.title}
                  </h3>
                  <p className="text-xs text-stone-700 leading-relaxed italic line-clamp-2 mt-1 font-medium">
                    “{bhashini.memoryNote}”
                  </p>
                </div>

                <div className="pt-2.5 border-t border-[#E0D7C6] flex items-center justify-between">
                  <span className="text-xs text-stone-500 font-bold truncate max-w-[130px]">
                    {bt.photoAddedBy} {photo.addedBy}
                  </span>

                  <div className="flex items-center space-x-2">
                    {/* Read Memory Voice button */}
                    <button
                      onClick={() => handleSpeakMemory(photo)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#F4EFE6] hover:bg-[#EAE2D3] text-emerald-950 text-xs font-black rounded-xl border border-[#D5CAB6] transition-colors cursor-pointer"
                      title={bt.listenMemory}
                    >
                      <Volume2 className={`w-4 h-4 ${isReading ? 'animate-bounce text-emerald-700' : 'text-emerald-800'}`} />
                      <span>{isReading ? bt.speakingMemory : bt.listenMemory}</span>
                    </button>

                    {/* Caregiver Actions: Delete */}
                    {currentRole === 'caregiver' && onDeletePhoto && (
                      <button
                        onClick={() => {
                          playGentleTap();
                          onDeletePhoto(photo.id);
                        }}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Modal (Caregiver or Patient) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center space-x-2">
                <Images className="w-5 h-5 text-teal-600" />
                <h3 className="text-base sm:text-lg font-bold text-stone-900">
                  {t.uploadPhotoBtn}
                </h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Bhashini Presets Quick Select */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                  {bt.quickSelectPresets}
                </span>
                <span className="text-[9px] bg-teal-50 text-teal-800 font-bold px-1.5 py-0.2 rounded border border-teal-200">
                  Bhashini Indic
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {BHASHINI_PHOTO_PRESETS.map((preset) => {
                  const loc = preset.translations[language] || preset.translations.en;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className="p-2 text-left rounded-xl border border-stone-200 bg-stone-50 hover:bg-teal-50 hover:border-teal-300 text-xs text-stone-800 transition-colors cursor-pointer"
                    >
                      <span className="font-bold block truncate">{loc.title}</span>
                      <span className="text-[10px] text-teal-700 font-medium block truncate">{loc.relation}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmitPhoto} className="space-y-3.5 pt-1">
              
              {/* Photo Input (File or URL) */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  {t.photoUrlLabel}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or upload below"
                    className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:border-teal-600"
                    required
                  />
                  <label className="cursor-pointer px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold flex items-center space-x-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{bt.uploadFromDevice}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Preview if present */}
              {photoUrl && (
                <div className="relative aspect-16/9 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                  <img
                    src={photoUrl}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  {t.photoTitleLabel}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Granddaughter Ria's Graduation"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:border-teal-600"
                  required
                />
              </div>

              {/* Relationship (with Bhashini Quick Selector) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    {t.photoRelationLabel}
                  </label>
                  <span className="text-[10px] text-teal-700 font-bold">
                    Quick Select:
                  </span>
                </div>
                
                {/* Bhashini Kinship pills for one-click selection */}
                <div className="flex flex-wrap gap-1 mb-1.5 max-h-16 overflow-y-auto">
                  {['granddaughter', 'grandson', 'daughter', 'son', 'entire family', 'spouse'].map((relKey) => {
                    const localizedRel = BHASHINI_RELATIONS[relKey]?.[language] || BHASHINI_RELATIONS[relKey]?.en || relKey;
                    return (
                      <button
                        key={relKey}
                        type="button"
                        onClick={() => setRelation(localizedRel)}
                        className="px-2 py-0.5 bg-stone-100 hover:bg-teal-100 hover:text-teal-900 rounded-md text-[10px] font-bold text-stone-700 transition-colors cursor-pointer"
                      >
                        {localizedRel}
                      </button>
                    );
                  })}
                </div>

                <input
                  type="text"
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  placeholder={bt.selectRelationship}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:border-teal-600"
                  required
                />
              </div>

              {/* Memory Note */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  {t.photoNoteLabel}
                </label>
                <textarea
                  value={memoryNote}
                  onChange={(e) => setMemoryNote(e.target.value)}
                  placeholder="Write a sweet, calming sentence that will be read aloud to the patient in their language..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:border-teal-600"
                  required
                />
              </div>

              {/* Show in Dashboard Checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="featured-checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded-md focus:ring-teal-500 cursor-pointer"
                />
                <label htmlFor="featured-checkbox" className="text-xs sm:text-sm font-semibold text-stone-800 cursor-pointer">
                  {bt.featureOnHome}
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-colors cursor-pointer"
                >
                  {t.saveAndShowInDashboard}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
