
import React, { useState, useCallback } from 'react';
import { generateWallpapers } from './services/geminiService';
import Spinner from './components/Spinner';
import ImageModal from './components/ImageModal';

// --- Helper Components (Defined outside App to prevent re-creation on re-renders) ---

const Header: React.FC = () => (
    <header className="text-center p-4 pt-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          AI 배경화면 생성기
        </h1>
        <p className="text-gray-400 mt-2">당신만의 특별한 휴대폰 배경화면을 만들어보세요.</p>
    </header>
);

interface PromptFormProps {
    prompt: string;
    setPrompt: (value: string) => void;
    onGenerate: () => void;
    isLoading: boolean;
}

const PromptForm: React.FC<PromptFormProps> = ({ prompt, setPrompt, onGenerate, isLoading }) => (
    <div className="sticky bottom-0 left-0 right-0 p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700">
        <div className="max-w-xl mx-auto flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="예: 고요한 밤하늘의 은하수"
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-shadow"
              disabled={isLoading}
            />
            <button
              onClick={onGenerate}
              disabled={isLoading}
              className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              생성
            </button>
        </div>
    </div>
);

interface ImageGridProps {
    images: string[];
    onImageClick: (url: string) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({ images, onImageClick }) => (
    <div className="grid grid-cols-2 gap-4 p-4 max-w-xl mx-auto">
        {images.map((img, index) => (
          <div 
            key={index} 
            className="aspect-[9/16] rounded-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-300 shadow-md hover:shadow-purple-500/30" 
            onClick={() => onImageClick(img)}>
            <img src={img} alt={`Generated wallpaper ${index + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
    </div>
);

const WelcomeMessage: React.FC = () => (
    <div className="flex flex-col items-center justify-center text-center p-8 mt-10">
        <svg className="w-24 h-24 mb-4 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h2 className="text-2xl font-semibold mb-2">어떤 배경화면을 만들어 볼까요?</h2>
        <p className="text-gray-400">화면 하단에 원하는 분위기를 설명하고 '생성' 버튼을 눌러보세요.</p>
    </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('비 오는 서정적인 도시 풍경');
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const executeGeneration = useCallback(async (generationPrompt: string) => {
    if (!generationPrompt.trim()) {
      setError('배경화면으로 만들고 싶은 분위기를 입력해주세요.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setImages([]);

    try {
      const generatedImages = await generateWallpapers(generationPrompt);
      setImages(generatedImages);
    } catch (err: any) {
      setError(err.message || '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleGenerate = useCallback(() => {
    executeGeneration(prompt);
  }, [prompt, executeGeneration]);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow pb-28"> {/* Increased padding-bottom to avoid overlap with sticky form */}
        {isLoading && <div className="mt-10"><Spinner /></div>}
        {error && <p className="text-red-500 text-center mt-4 p-4">{error}</p>}
        
        {!isLoading && images.length === 0 && !error && <WelcomeMessage />}
        
        {images.length > 0 && <ImageGrid images={images} onImageClick={handleImageClick} />}
      </main>

      <PromptForm 
        prompt={prompt}
        setPrompt={setPrompt}
        onGenerate={handleGenerate}
        isLoading={isLoading}
      />

      {selectedImage && (
        <ImageModal 
          imageUrl={selectedImage} 
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default App;
