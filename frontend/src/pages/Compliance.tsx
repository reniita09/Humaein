export default function Compliance() {
    return (
      <div className="min-h-screen bg-white text-gray-800 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Compliance & Security</h1>
  
          <p className="mb-6 text-gray-600 leading-relaxed">
            At Humaein, compliance and data protection are at the core of our operations. We adhere to globally recognized healthcare and information security standards to ensure our clients’ data remains protected.
          </p>
  
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Regulatory Framework</h2>
          <p className="mb-6 text-gray-600">
            Humaein complies with HIPAA (Health Insurance Portability and Accountability Act), GDPR (General Data Protection Regulation), and UAE data protection standards where applicable.
          </p>
  
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Data Encryption</h2>
          <p className="mb-6 text-gray-600">
            All sensitive data, including claim and patient details, are encrypted both in transit and at rest using industry-standard encryption algorithms (AES-256, TLS 1.3).
          </p>
  
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Access Control</h2>
          <p className="mb-6 text-gray-600">
            Access to data is restricted based on user roles and is continuously monitored through audit trails and anomaly detection systems.
          </p>
  
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Audit & Monitoring</h2>
          <p className="mb-6 text-gray-600">
            Regular third-party security audits and internal reviews ensure continued compliance with data protection requirements and best practices.
          </p>
  
          <p className="text-gray-500 text-sm mt-12">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    )
  }
  