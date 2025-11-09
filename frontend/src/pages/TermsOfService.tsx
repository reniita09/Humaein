export default function TermsOfService() {
    return (
      <div className="min-h-screen bg-white text-gray-800 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
  
          <p className="mb-6 text-gray-600 leading-relaxed">
            Welcome to Humaein. By accessing or using our platform, you agree to comply with and be bound by the following
            Terms of Service. Please read them carefully before using our services.
          </p>
  
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Use of the Platform</h2>
          <p className="mb-6 text-gray-600">
            Our platform provides AI-driven revenue cycle management tools for healthcare organizations.
            You agree to use our services only for lawful purposes and in compliance with applicable regulations.
          </p>
  
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Account and Access</h2>
          <p className="mb-6 text-gray-600">
            You are responsible for maintaining the confidentiality of your login credentials and any activity that occurs under your account.
            Unauthorized access or sharing of credentials is strictly prohibited.
          </p>
  
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Ownership</h2>
          <p className="mb-6 text-gray-600">
            All data uploaded or generated through Humaein remains the property of the client organization.
            Humaein may process this data solely for providing and improving the service.
          </p>
  
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Limitation of Liability</h2>
          <p className="mb-6 text-gray-600">
            Humaein shall not be liable for any indirect, incidental, or consequential damages resulting from your use or inability to use the platform.
          </p>
  
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Changes to Terms</h2>
          <p className="mb-6 text-gray-600">
            We may update these Terms periodically. Any changes will be communicated through our website or platform notifications.
          </p>
  
          <p className="text-gray-500 text-sm mt-12">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    )
  }
  