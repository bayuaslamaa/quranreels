import { Linkedin, Coffee, Instagram, } from 'lucide-react';
import Link from 'next/link';

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow rounded-lg p-8">
                    <h1 className="text-3xl font-bold text-center mb-8 text-black">About the Developer</h1>

                    <div className="prose max-w-none">
                        <p className="text-gray-600 mb-6">
                            Assalamu&apos;alaikum Hi! I&apos;m Bayu, a passionate developer dedicated to creating meaningful applications
                            that help people connect with the Quran. This project is built with love and dedication
                            to serve the Muslim community.
                        </p>
                    </div>
                    <div className="mt-8 text-center">
                        <Link
                            href="http://lynk.id/kerjasambilumroh/rwle95ldykwx/checkout"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFDD00] text-black font-bold rounded-lg hover:bg-opacity-90 transition-all"
                        >
                            <Coffee className="w-6 h-6" />
                            <span>Buy me a coffee</span>
                        </Link>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center items-start gap-4 mt-8">
                        <Link
                            href="https://www.linkedin.com/in/bayuaslamaa/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-[#0077B5] text-white rounded-lg hover:bg-opacity-90 transition-all"
                        >
                            <Linkedin className="w-5 h-5" />
                            <span>LinkedIn</span>
                        </Link>

                        <Link
                            href="https://www.instagram.com/bayuaslama_/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-[#E1306C] text-white rounded-lg hover:bg-opacity-90 transition-all"
                        >
                            <Instagram className="w-5 h-5" />
                            <span>Instagram</span>
                        </Link>
                        <Link
                            href="https://www.tiktok.com/@bayuaslama_"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-[#010101] text-white rounded-lg hover:bg-opacity-90 transition-all"
                        >

                            <span>Tiktok</span>
                        </Link>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default AboutPage;
