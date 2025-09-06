import { Users, TrendingUp, Award, CheckCircle } from 'lucide-react';
import { useCounterAnimation } from '@/hooks/use-scroll-animation';

const Statistics = () => {
  const mentorsData = useCounterAnimation(500, 2000);
  const successData = useCounterAnimation(85, 1500);
  const graduatesData = useCounterAnimation(1200, 2500);
  const programsData = useCounterAnimation(50, 1000);

  const stats = [
    {
      ref: mentorsData.ref,
      icon: Users,
      value: mentorsData.count,
      suffix: '+',
      label: 'Verified Mentors',
      description: 'From top U.S. dental programs'
    },
    {
      ref: successData.ref,
      icon: TrendingUp,
      value: successData.count,
      suffix: '%',
      label: 'Success Rate',
      description: 'Students passing on first attempt'
    },
    {
      ref: graduatesData.ref,
      icon: Award,
      value: graduatesData.count,
      suffix: '+',
      label: 'Success Stories',
      description: 'International graduates helped'
    },
    {
      ref: programsData.ref,
      icon: CheckCircle,
      value: programsData.count,
      suffix: '+',
      label: 'Partner Programs',
      description: 'Dental schools & residencies'
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Proven Track Record
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our mentorship program has helped thousands of international dental graduates 
            achieve their dreams of practicing dentistry in the United States.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                ref={stat.ref}
                className="text-center p-8 card-hover rounded-2xl group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                <div className="counter-number text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.value}{stat.suffix}
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {stat.label}
                </h3>
                
                <p className="text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Statistics;