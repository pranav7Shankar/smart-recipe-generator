import { Github, Mail, Heart, UtensilsCrossed } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white mt-12 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-10 text-center md:text-left">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">

          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-orange-600" />
            <a href="#">
            <span className="text-xl font-bold text-gray-800">
              SmartRecipeGenerator
            </span>
            </a>
          </div>

          <div className="text-center text-sm text-gray-500">
          Made with <Heart className="w-4 h-4 inline text-red-500" /> by{" "}
          <span className="font-semibold text-gray-700">Pranav Shankar</span> •{" "}
          <span className="text-gray-400">© {new Date().getFullYear()} All rights reserved.</span>
        </div>


          <div className="flex items-center gap-5 text-gray-600">
            <a
              href="https://github.com/pranav7Shankar"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-600 transition"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="mailto:pranav7shankar@gmail.com"
              className="hover:text-orange-600 transition"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
