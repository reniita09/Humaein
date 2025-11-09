import { Upload, CheckCircle, DollarSign } from 'lucide-react';

function HowItWorks() {
  const steps = [
    {
      icon: Upload,
      title: 'Upload',
      description: 'Submit claims through our seamless integration with your practice management system or EHR.',
      color: 'blue',
    },
    {
      icon: CheckCircle,
      title: 'Validate',
      description: 'Our AI engine scrubs every claim for errors, verifies eligibility, and ensures compliance.',
      color: 'teal',
    },
    {
      icon: DollarSign,
      title: 'Get Paid',
      description: 'Clean claims are submitted automatically, tracked in real-time, and payments reconciled instantly.',
      color: 'green',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Three simple steps to transform your revenue cycle from manual chaos to automated excellence.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-1/4 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-200 via-teal-200 to-green-200"></div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            const colorClasses = {
              blue: 'bg-blue-100 text-blue-600 group-hover:bg-blue-600',
              teal: 'bg-teal-100 text-teal-600 group-hover:bg-teal-600',
              green: 'bg-green-100 text-green-600 group-hover:bg-green-600',
            }[step.color];

            return (
              <div key={index} className="relative text-center group">
                <div className="flex flex-col items-center space-y-4">
                  <div className={`w-20 h-20 ${colorClasses} rounded-2xl flex items-center justify-center transition-all shadow-lg relative z-10`}>
                    <Icon className="w-10 h-10 group-hover:text-white transition-colors" />
                  </div>
                  <div className="absolute -top-2 -left-2 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm z-20">
                    {index + 1}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
