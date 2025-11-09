export default function PrivacyPolicy() {
    return (
      <div className="min-h-screen bg-white text-gray-800 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
  
          <p className="mb-6 text-gray-600 leading-relaxed">
            Humaein is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information when you interact with our platform.
          </p>
  
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
          <p className="mb-6 text-gray-600">
            We collect data you provide directly, such as registration details and uploaded claim information, and data automatically collected through analytics and cookies.
          </p>
  
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Data</h2>
          <p className="mb-6 text-gray-600">
            Your data helps us deliver core platform functionality, improve AI model accuracy, and enhance your experience.
            We do not sell or share personal data with third parties for marketing purposes.
          </p>
  
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Security</h2>
          <p className="mb-6 text-gray-600">
            We implement strict encryption, secure access control, and continuous monitoring to protect your data from unauthorized access or breaches.
          </p>
  
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Your Rights</h2>
          <p className="mb-6 text-gray-600">
            You may request access, correction, or deletion of your personal data at any time by contacting our support team.
          </p>
  
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Policy Updates</h2>
          <p className="mb-6 text-gray-600">
            We may revise this policy occasionally. Continued use of our platform constitutes acceptance of those changes.
          </p>
  
          <p className="text-gray-500 text-sm mt-12">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    )
  }
  