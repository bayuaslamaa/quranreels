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
    const { surah_id, verse } = router?.query
    console.log({ surah_id, verse })
    const [verses, setVerses] = useState<Verse[]>([])
    const [currentVerseIndex, setCurrentVerseIndex] = useState<number>(0)
    const [isUserScrolling, setIsUserScrolling] = useState(false)
    const [selectedVerse, setSelectedVerse] = useState(0)

    useEffect(() => {
        // Create intersection observer
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const index = Number(entry.target.getAttribute('data-index'))
                        setCurrentVerseIndex(index)
                        setIsUserScrolling(true)
                    }
                })
            },
            { threshold: 0.7 } // Trigger when verse is 70% visible
        )

        // Observe all verse elements
        document.querySelectorAll('.verse-container').forEach((el) => {
            observer.observe(el)
        })

        return () => observer.disconnect()
    }, [verses]) // Re-run when verses change

    console.log({ currentVerseIndex })

    // Add this effect to handle initial scroll when verses are loaded
    useEffect(() => {
        if (verses.length > 0 && verse && !isUserScrolling) {
            const verseIndex = parseInt(verse as string) - 1
            if (verseIndex >= 0 && verseIndex < verses.length) {
                const element = document.querySelector(`[data-index="${verseIndex}"]`)
                element?.scrollIntoView({ behavior: 'smooth' })
            }
        }
        setIsUserScrolling(false)
    }, [verses, verse])

    // Function to scroll to a specific verse
    const scrollToVerse = (index: number) => {
        const element = document.querySelector(`[data-index="${index}"]`)
        element?.scrollIntoView({ behavior: 'smooth' })
    }

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

    // Add this effect to update URL when currentVerseIndex changes
    useEffect(() => {
        if (verses.length > 0 && isUserScrolling) {
            const verseNumber = currentVerseIndex + 1
            router.push(
                {
                    pathname: router.pathname,
                    query: { surah_id, verse: verseNumber }
                },
                undefined,
                { shallow: true } // Prevents unnecessary data fetching
            )
        }
    }, [currentVerseIndex])

    console.log({ verses })
    return (
        <div className="h-screen w-screen bg-gray-100 overflow-hidden">
            {/* Optional: Display current verse number with navigation buttons */}
            <div className="fixed top-[75px] right-4 bg-black text-white px-4 py-2 rounded-full flex items-center gap-2">
                <button
                    onClick={() => scrollToVerse(Math.max(0, currentVerseIndex - 1))}
                    className="hover:opacity-75"
                >
                    ←
                </button>
                Ayat {currentVerseIndex + 1} dari {verses.length}
                <button
                    onClick={() => scrollToVerse(Math.min(verses.length - 1, currentVerseIndex + 1))}
                    className="hover:opacity-75"
                >
                    →
                </button>
            </div>

            {/* Fixed verse input in bottom right */}
            <div className="fixed bottom-4 right-4 bg-white border-2 text-black px-4 py-2 rounded-full flex items-center gap-2">
                <input
                    type="number"
                    min={1}
                    max={verses.length}
                    className="w-16 px-2 py-1 text-black rounded-md"
                    placeholder="Ayat"
                    onChange={(e) => {
                        const value = parseInt((e.target as HTMLInputElement).value)
                        setSelectedVerse(value)
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const value = parseInt((e.target as HTMLInputElement).value)
                            if (value >= 1 && value <= verses.length) {
                                scrollToVerse(value - 1)
                                    ; (e.target as HTMLInputElement).value = ''
                            }
                        }
                    }}
                />
                <div className="text-sm" onClick={() => scrollToVerse(selectedVerse - 1)}>Go</div>
            </div>

            {/* Scroll container with vertical snap behavior */}
            <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory">
                {verses?.map((item: Verse, i) => (
                    <div
                        key={i}
                        data-index={i}
                        className="verse-container h-screen w-screen flex flex-col items-center justify-center snap-start bg-white border-b border-gray-200"
                    >
                        <div className="p-4 text-center">
                            <h3 className='text-black mb-4 bg-green-50'> {item?.number?.inSurah}</h3>
                            <h2 className="text-3xl font-bold mb-2 text-black leading-relaxed">{item?.text?.arab}</h2>
                            {item?.text?.arab?.length < 500 && <p className="text-gray-500">{item?.text?.transliteration?.en}</p>}
                            {item?.text?.arab?.length < 200 && <p className="text-gray-700 mt-4 font-semibold">{item?.number?.inSurah}. {item?.translation?.id}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SurahPage;
