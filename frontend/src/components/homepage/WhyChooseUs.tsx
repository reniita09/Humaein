import { Zap, Target, Award } from 'lucide-react';

function WhyChooseUs() {
  const reasons = [
    {
      icon: Target,
      title: 'Unmatched Accuracy',
      description: 'Our AI models are trained on millions of claims, achieving 98%+ accuracy in error detection and correction before submission.',
    },
    {
      icon: Zap,
      title: 'Lightning Speed',
      description: 'What takes hours manually happens in seconds. Submit claims 10x faster and receive payments weeks earlier.',
    },
    {
      icon: Award,
      title: 'Regulatory Compliance',
      description: 'Built-in adherence to DHA, MOH, and ADH regulations ensures you stay audit-ready and compliant at all times.',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-teal-600 to-blue-700 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Why Choose Humaein
          </h2>
          <p className="text-lg text-teal-100 max-w-2xl mx-auto">
            Powered by AI, backed by expertise, and built for healthcare providers who refuse to compromise.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 hover:bg-white/20 transition-all"
              >
                <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {reason.title}
                </h3>
                <p className="text-teal-100 leading-relaxed">
                  {reason.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-8 text-center">
          <p className="text-xl font-semibold mb-2">
            Expert-in-the-Loop RCM Team
          </p>
          <p className="text-teal-100">
            Our certified billing specialists bring over 20 years of combined experience, working alongside AI to handle complex cases and ensure optimal outcomes.
          </p>
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
