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
    audio: {
        primary: string;
    };
}

const SurahPage: React.FC = () => {
    // Add this ref to store current audio instance
    const audioRef = React.useRef<HTMLAudioElement | null>(null);
    // Add state to track if audio is playing
    const [isPlaying, setIsPlaying] = useState(false);
    // Add ref to track if auto-scrolling is in progress
    const scrollingRef = React.useRef(false);
    // Add state to track which verse is currently playing
    const [playingVerseIndex, setPlayingVerseIndex] = useState<number | null>(null);
    // Add a ref to track if we're in auto-play sequence
    const autoPlayRef = React.useRef(false);

    const router = useRouter()
    const { surah_id, verse } = router?.query
    console.log({ surah_id, verse })
    const [verses, setVerses] = useState<Verse[]>([])
    const [currentVerseIndex, setCurrentVerseIndex] = useState<number>(0)
    const [isUserScrolling, setIsUserScrolling] = useState(false)
    const [selectedVerse, setSelectedVerse] = useState(0)
    const [surahName, setSurahName] = useState("")
    const [showTranslate, setShowTranslate] = useState(false)

    useEffect(() => {
        // Create intersection observer
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const index = Number(entry.target.getAttribute('data-index'))
                        setCurrentVerseIndex(index)
                        setIsUserScrolling(true)
                        setSelectedVerse(0)

                        // Only stop audio if it's manual scrolling (not auto-scroll)
                        if (!scrollingRef.current && !autoPlayRef.current && audioRef.current) {
                            audioRef.current.pause();
                            audioRef.current = null;
                            setIsPlaying(false);
                            setPlayingVerseIndex(null);
                            autoPlayRef.current = false;
                        }
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

    // Modify the scrollToVerse function to stop audio
    const scrollToVerse = (index: number) => {
        if (audioRef.current && !scrollingRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
            setIsPlaying(false);
        }
        const element = document.querySelector(`[data-index="${index}"]`)
        element?.scrollIntoView({ behavior: 'smooth' })
    }

    // Add effect to stop audio on verse change
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
    }, [currentVerseIndex]);

    useEffect(() => {
        async function fetchVerses() {
            if (!surah_id) return
            try {
                const response = await fetch(`https://api.quran.gading.dev/surah/${surah_id}`);
                const data = await response.json();
                console.log({ data })
                const surahName = data?.data?.name?.transliteration?.id
                setSurahName(surahName)
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

    // Modify handleAudioEnd to better handle the auto-play sequence
    const handleAudioEnd = (currentIndex: number) => {
        setIsPlaying(false);
        setPlayingVerseIndex(null);
        audioRef.current = null;

        if (currentIndex < verses.length - 1) {
            autoPlayRef.current = true;
            scrollingRef.current = true;
            scrollToVerse(currentIndex + 1);

            // Increase timeout to ensure scroll completes
            setTimeout(() => {
                if (autoPlayRef.current) {
                    const nextAudio = new Audio(verses[currentIndex + 1]?.audio?.primary);
                    audioRef.current = nextAudio;
                    nextAudio.addEventListener('ended', () => handleAudioEnd(currentIndex + 1));
                    nextAudio.play();
                    setIsPlaying(true);
                    setPlayingVerseIndex(currentIndex + 1);
                }
                scrollingRef.current = false;
            }, 500);
        }
    };

    // Update intersection observer to respect auto-play sequence
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const index = Number(entry.target.getAttribute('data-index'));
                        setCurrentVerseIndex(index);
                        setIsUserScrolling(true);
                        setSelectedVerse(0);

                        // Only stop audio if it's manual scrolling (not auto-scroll)
                        if (!scrollingRef.current && !autoPlayRef.current && audioRef.current) {
                            audioRef.current.pause();
                            audioRef.current = null;
                            setIsPlaying(false);
                            setPlayingVerseIndex(null);
                            autoPlayRef.current = false;
                        }
                    }
                });
            },
            { threshold: 0.7 }
        );

        document.querySelectorAll('.verse-container').forEach((el) => {
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, [verses]);

    // Update playAudio to handle manual play/pause
    const playAudio = (index: number) => {
        autoPlayRef.current = false; // Reset auto-play when manually controlling audio

        if (isPlaying && playingVerseIndex === index && audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
            setPlayingVerseIndex(null);
            return;
        }

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
            setIsPlaying(false);
        }

        const audio = new Audio(verses[index]?.audio?.primary);
        audioRef.current = audio;
        audio.addEventListener('ended', () => handleAudioEnd(index));
        audio.play();
        setIsPlaying(true);
        setPlayingVerseIndex(index);
    };

    // Add cleanup for component unmount
    useEffect(() => {
        return () => {
            autoPlayRef.current = false;
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
                setIsPlaying(false);
                setPlayingVerseIndex(null);
            }
        };
    }, []);

    console.log({ verses })
    return (
        <div className="h-screen w-screen bg-gray-100 overflow-hidden">
            {/* Optional: Display current verse number with navigation buttons */}
            <div className="fixed top-[25px] left-4 bg-black text-white px-4 py-2 rounded-full flex items-center gap-2" onClick={() => router.push("/")}>
                List Surat
            </div>
            <div className="fixed top-[25px] right-4 bg-black text-white px-4 py-2 rounded-full flex items-center gap-2">
                <div className="flex flex-col">

                    <p className='text-center'>{surahName}</p>
                    <div>

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
                </div>
            </div>

            {/* Fixed verse input in bottom right */}
            <div className="fixed bottom-[85px] right-4 bg-white border-2 text-black px-4 py-2 rounded-full flex items-center gap-2">
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
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <button
                                    onClick={() => playAudio(i)}
                                    className={`p-2 rounded-full ${isPlaying && playingVerseIndex === i
                                        ? 'bg-green-500 text-white'
                                        : 'bg-green-100 text-black'
                                        }`}
                                >
                                    {isPlaying && playingVerseIndex === i ? (
                                        <>Stop <span role="img" aria-label="pause">⏸️</span></>
                                    ) : (
                                        <>Dengar <span role="img" aria-label="play">🔊</span></>
                                    )}
                                </button>
                                <h3 className='text-black bg-green-50'> {item?.number?.inSurah}</h3>

                            </div>
                            {!showTranslate ? <h2 className={`${item?.text?.arab.length < 510 ? "text-[28px]" : "text-2xl"} font-bold mb-2 text-black leading-relaxed`} onClick={() => setShowTranslate(!showTranslate)}>{item?.text?.arab}</h2>
                                : <div onClick={() => setShowTranslate(!showTranslate)}>
                                    <p className="text-gray-500">{item?.text?.transliteration?.en}</p>
                                    <p className="text-gray-700 mt-4 font-semibold">{item?.number?.inSurah}. {item?.translation?.id}</p>
                                </div>}
                            <small className='text-black'>Tap untuk munculkan {!showTranslate ? "terjemahan dan transliterasi" : "ayat"}</small>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SurahPage;

