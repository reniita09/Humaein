import { Activity, Mail, Phone, MapPin } from 'lucide-react'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="w-8 h-8 text-teal-400" strokeWidth={2.5} />
              <span className="text-2xl font-bold text-white">Humaein</span>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6 max-w-lg">
              AI-powered revenue cycle management platform designed to eliminate administrative
              burden and maximize revenue for healthcare providers.
            </p>
          </div>

          {/* Contact Section */}
          <div className="md:ml-auto">
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <Mail className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                <a
                  href="mailto:info@humaein.com"
                  className="hover:text-teal-400 transition-colors"
                >
                  info@humaein.com
                </a>
              </li>
              <li className="flex items-start space-x-2">
                <Phone className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                <a
                  href="tel:+97143210000"
                  className="hover:text-teal-400 transition-colors"
                >
                  +971 4 321 0000
                </a>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400">Dubai Healthcare City, UAE</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © {currentYear} Humaein. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
  <a href="/privacy-policy" className="hover:text-teal-400 transition-colors">Privacy Policy</a>
  <a href="/terms-of-service" className="hover:text-teal-400 transition-colors">Terms of Service</a>
  <a href="/compliance" className="hover:text-teal-400 transition-colors">Compliance</a>
</div>

        </div>
      </div>
    </footer>
  )
}

export default Footer
