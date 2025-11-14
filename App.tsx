
import React, { useState, useRef } from 'react';
import { generateImageFromImageAndPrompt } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import { UploadIcon, SparklesIcon, ImageIcon } from './components/Icons';
import { Loader } from './components/Loader';

// Define SourceImage outside the App component
interface SourceImage {
  dataUrl: string;
  base64: string;
  mimeType: string;
}

interface GeneratedImages {
  studio: string | null;
  concept: string | null;
}

const App: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<SourceImage | null>(null);
  const studioPrompt = `Generate a high-quality, square (1:1) studio product image based on the reference photo of the Hibiso tea box (Trà tía tô + Hibiscus). Keep the original box exactly the same — same colors, logo, text, proportions, and details. Do not modify or redraw the packaging design. Only enhance lighting, clarity, and background for a professional studio look. Use soft, even lighting with natural shadows on a clean white background. Style: studio product photography, realistic lighting, high detail, e-commerce ready. No watermark, no text overlay, ultra-realistic commercial photography style.`;
  const conceptPrompt = `cô gái trẻ việt nam vô cùng xinh đẹp, trong trang phục áo dài việt nam màu tím, trên tay đang bưng một tách trà. có vẻ như là một cô người mẫu đang chụp ảnh pr quảng bá cho sản phẩm trà tía tô. cô gái cười tươi xinh đẹp với ánh mắt mời gọi thu hút ánh nhìn. hãy cố gắng giữ sản phẩm nguyên như hình ảnh mẫu. bối cảnh cô gái đang ngồi trong phòng thưởng thức trà, trên bàn có 1 ấm trà, tách trà với một giỏ lá tía tô, và hộp trà như hình ảnh mẫu nhằm quảng bá thêm cho sản phẩm. hãy đóng vai trò là một chuyên gia trong lĩnh vực marketing để tạo ra bức ảnh đẹp.`;
  
  const [generatedImages, setGeneratedImages] = useState<GeneratedImages>({ studio: null, concept: null });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const { base64, mimeType } = await fileToBase64(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setSourceImage({
            dataUrl: reader.result as string,
            base64,
            mimeType,
          });
          setGeneratedImages({ studio: null, concept: null }); // Reset images on new upload
          setError(null);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setError('Failed to read image file.');
        console.error(err);
      }
    }
  };

  const handleGenerate = async () => {
    if (!sourceImage) {
      setError('Please upload an image first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages({ studio: null, concept: null });

    try {
      const [studioResult, conceptResult] = await Promise.all([
        generateImageFromImageAndPrompt(sourceImage.base64, sourceImage.mimeType, studioPrompt),
        generateImageFromImageAndPrompt(sourceImage.base64, sourceImage.mimeType, conceptPrompt),
      ]);
      setGeneratedImages({ studio: studioResult, concept: conceptResult });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Generation failed: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const OutputPanel = ({ title, image, filename, isLoading }: { title: string, image: string | null, filename: string, isLoading: boolean }) => (
    <div className="flex flex-col bg-gray-800/50 rounded-2xl p-4 border border-gray-700">
      <h3 className="text-xl font-bold mb-3 text-gray-200">{title}</h3>
      <div className="w-full flex-grow flex items-center justify-center bg-gray-900/50 rounded-lg min-h-[250px] aspect-square">
        {isLoading ? (
          <Loader large={true} />
        ) : image ? (
          <img src={image} alt={title} className="max-w-full max-h-full object-contain rounded-md" />
        ) : (
          <div className="text-gray-500 text-center p-4">
            <ImageIcon className="mx-auto h-12 w-12" />
            <p className="mt-2 text-sm">The generated image will appear here.</p>
          </div>
        )}
      </div>
      {image && !isLoading && (
        <a
          href={image}
          download={filename}
          className="mt-4 w-full text-center bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
        >
          Download Image
        </a>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
          AI Product Shot Generator
        </h1>
        <p className="mt-2 text-lg text-gray-400">
          Transform your product photos into professional marketing assets.
        </p>
      </header>

      <main className="flex-grow grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="bg-gray-800/50 rounded-2xl p-6 flex flex-col space-y-6 border border-gray-700 shadow-lg">
          <div className="flex-grow flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-gray-200">1. Upload Your Product Image</h2>
            <div
              className="flex-grow flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-purple-400 hover:bg-gray-800 transition-colors min-h-[300px]"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
              />
              {sourceImage ? (
                <img src={sourceImage.dataUrl} alt="Uploaded product" className="max-h-80 object-contain rounded-md" />
              ) : (
                <div className="text-gray-400">
                  <UploadIcon className="mx-auto h-12 w-12" />
                  <p className="mt-2">Click to upload an image</p>
                  <p className="text-xs mt-1">PNG, JPG, or WEBP</p>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !sourceImage}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            {isLoading ? (
              <>
                <Loader />
                Generating...
              </>
            ) : (
              <>
                <SparklesIcon className="h-6 w-6" />
                Generate Images
              </>
            )}
          </button>
        </div>

        {/* Output Panel */}
        <div className="bg-gray-800/50 rounded-2xl p-6 flex flex-col border border-gray-700 shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-200">2. Your AI-Generated Images</h2>
           {error && (
              <div className="text-red-400 text-center p-4 bg-red-900/50 rounded-lg mb-4">{error}</div>
            )}
          <div className="w-full flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
            <OutputPanel 
              title="Studio Shot" 
              image={generatedImages.studio} 
              filename="studio-shot.png"
              isLoading={isLoading}
            />
            <OutputPanel 
              title="Concept Shot" 
              image={generatedImages.concept} 
              filename="concept-shot.png"
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
