import { TrendingDown, TrendingUp, Clock, Award } from 'lucide-react';

function Results() {
  const metrics = [
    {
      icon: TrendingDown,
      value: '40%',
      label: 'Reduction in Denials',
      description: 'AI-powered validation prevents errors before they happen',
      color: 'green',
    },
    {
      icon: TrendingUp,
      value: '95%',
      label: 'Clean Claim Rate',
      description: 'First-pass approval rate industry-leading standard',
      color: 'teal',
    },
    {
      icon: Clock,
      value: '50%',
      label: 'Faster Payment Cycle',
      description: 'Get paid in weeks, not months',
      color: 'blue',
    },
    {
      icon: Award,
      value: '99.8%',
      label: 'Compliance Score',
      description: 'Full adherence to regulatory requirements',
      color: 'indigo',
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Proven Results That Drive Growth
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Healthcare providers using Humaein see immediate impact on their bottom line and operational efficiency.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            const bgColor = {
              green: 'bg-green-100',
              teal: 'bg-teal-100',
              blue: 'bg-blue-100',
              indigo: 'bg-blue-100',
            }[metric.color];
            const textColor = {
              green: 'text-green-600',
              teal: 'text-teal-600',
              blue: 'text-blue-600',
              indigo: 'text-blue-600',
            }[metric.color];

            return (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-lg transition-all"
              >
                <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`w-6 h-6 ${textColor}`} />
                </div>
                <div className={`text-4xl font-bold ${textColor} mb-2`}>
                  {metric.value}
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-2">
                  {metric.label}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {metric.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Results;
