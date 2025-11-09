import {
  ShieldCheck,
  AlertCircle,
  UserCheck,
  FileText,
  Banknote,
  BarChart3,
  ClipboardCheck,
  Scale
} from 'lucide-react';

function Features() {
  const features = [
    {
      icon: ShieldCheck,
      title: 'Claim Scrubbing',
      description: 'AI-powered validation catches errors before submission, ensuring clean claims every time.',
    },
    {
      icon: AlertCircle,
      title: 'Denial Management',
      description: 'Intelligent tracking and automated appeals reduce denials and recover lost revenue.',
    },
    {
      icon: UserCheck,
      title: 'Eligibility Check',
      description: 'Real-time verification of patient coverage prevents billing surprises and rejections.',
    },
    {
      icon: FileText,
      title: 'Remittance Processing',
      description: 'Automated posting of payments and EOBs streamlines reconciliation workflows.',
    },
    {
      icon: Banknote,
      title: 'Bank Settlement',
      description: 'Seamless payment tracking and reconciliation from insurers to your accounts.',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Real-time insights into revenue performance, denial patterns, and operational metrics.',
    },
    {
      icon: ClipboardCheck,
      title: 'Prior Authorization',
      description: 'Streamlined pre-approval workflows reduce delays and improve patient experience.',
    },
    {
      icon: Scale,
      title: 'Compliance',
      description: 'Built-in adherence to DHA, MOH, and ADH regulations keeps you audit-ready.',
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Complete RCM Automation Suite
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Every tool you need to optimize revenue cycle performance — from patient registration to final payment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 group"
              >
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-600 transition-colors">
                  <Icon className="w-6 h-6 text-teal-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Features;
