// pages/index.tsx
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

// Add these types at the top of the file after the imports
interface Verse {
    number: {
        inSurah: number;
    };
    text: {
        arab: string;
        transliteration: {
            en: string;
        };
    };
    translation: {
        id: string;
    };
}

const SurahPage: React.FC = () => {

    const router = useRouter()
    const { surah_id } = router?.query
    console.log({ surah_id })
    const [verses, setVerses] = useState<Verse[]>([])
    useEffect(() => {
        async function fetchVerses() {
            if (!surah_id) return
            try {
                const response = await fetch(`https://api.quran.gading.dev/surah/${surah_id}`);
                const data = await response.json();
                setVerses(data?.data?.verses); // Assuming the API returns data in a 'data' property
            } catch (error) {
                console.error('Error fetching verses:', error);
            }
        }

        fetchVerses();
    }, [surah_id]);

    console.log({ verses })
    return (
        <div className="h-screen w-screen bg-gray-100 overflow-hidden">
            {/* Scroll container with vertical snap behavior */}
            <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory">
                {verses?.map((item: Verse, i) => (
                    <div
                        key={i}
                        className="h-screen w-screen flex flex-col items-center justify-center snap-start bg-white border-b border-gray-200"
                    >
                        <div className="p-4 text-center">
                            <h3 className='text-black mb-4 bg-green-50'> {item?.number?.inSurah}</h3>
                            <h2 className="text-3xl font-bold mb-2 text-black leading-relaxed">{item?.text?.arab}</h2>
                            {item?.text?.arab?.length < 500 && <p className="text-gray-500">{item?.text?.transliteration?.en}</p>}
                            {item?.text?.arab?.length < 200 && <p className="text-gray-700 mt-4 font-semibold">{item?.translation?.id}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SurahPage;
