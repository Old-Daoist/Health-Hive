import { Separator } from "./ui/separator";
import { Activity, Heart, Mail, Phone, MapPin } from "lucide-react";

export function Footer({ onNavigate }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>

              <span className="text-xl font-bold tracking-tight text-slate-900">
                Health Hive
              </span>
            </div>

            <p className="text-slate-600 text-sm">
              Connecting healthcare professionals and community members for
              better health outcomes through trusted dialogue.
            </p>

            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Heart className="w-4 h-4 text-red-500" />
              <span>Made with care for your health</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-900 font-semibold mb-4">Quick Links</h4>

            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate("about")}
                  className="text-slate-600 hover:text-blue-600 transition-colors"
                >
                  About Us
                </button>
              </li>

              <li>
                <button
                  onClick={() => onNavigate("help")}
                  className="text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Help & Support
                </button>
              </li>

              <li>
                <button
                  onClick={() => onNavigate("discussions")}
                  className="text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Forum Discussions
                </button>
              </li>

              <li>
                <button
                  onClick={() => onNavigate("data")}
                  className="text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Medical Data
                </button>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-slate-900 font-semibold mb-4">Resources</h4>

            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Privacy Policy
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Terms of Service
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Community Guidelines
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Medical Disclaimer
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-slate-900 font-semibold mb-4">Contact Us</h4>

            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-slate-600">
                <Mail className="w-4 h-4 mt-0.5 shrink-0" />

                <a
                  href="mailto:support@healthhive.com"
                  className="hover:text-blue-600 transition-colors"
                >
                  support@healthhive.com
                </a>
              </li>

              <li className="flex items-start gap-2 text-slate-600">
                <Phone className="w-4 h-4 mt-0.5 shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>

              <li className="flex items-start gap-2 text-slate-600">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  123 Healthcare Ave
                  <br />
                  Medical District, CA 90210
                </span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© {currentYear} Health Hive. All rights reserved.</p>

        </div>
      </div>
    </footer>
  );
}