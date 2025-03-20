// pages/index.tsx
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

interface Verse {
  number: number;
  name: {
    transliteration: {
      id: string;
    };
    short: string;
  };
}

const HomePage: React.FC = () => {
  const router = useRouter()
  const [verses, setVerses] = useState<Verse[]>([])
  useEffect(() => {
    async function fetchVerses() {
      try {
        const response = await fetch('https://api.quran.gading.dev/surah');
        const data = await response.json();
        setVerses(data?.data); // Assuming the API returns data in a 'data' property
      } catch (error) {
        console.error('Error fetching verses:', error);
      }
    }

    fetchVerses();
  }, []);

  console.log({ verses })
  return (
    <main className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-md mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4 text-black">List of Surahs</h1>

        <ul className="space-y-3">
          {verses.map((item: Verse, i) => (
            <li
              key={i}
              className="p-4 bg-white rounded shadow-sm hover:shadow-md transition"
              onClick={() => router.push(`/surah/${item?.number}`)}
            >
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-700">{item?.number}.</span>
                <span className="text-gray-900">{item?.name?.transliteration?.id}</span>
                <span className="text-gray-900">{item?.name?.short}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
};

export default HomePage;
