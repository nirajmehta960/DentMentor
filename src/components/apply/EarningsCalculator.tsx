import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calculator, Clock } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { useCounterAnimation } from '@/hooks/use-scroll-animation';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const experienceLevels = [
  { value: '1-3', label: '1-3 years', rate: 100 },
  { value: '4-7', label: '4-7 years', rate: 120 },
  { value: '8-12', label: '8-12 years', rate: 150 },
  { value: '13+', label: '13+ years', rate: 180 }
];

const specialtyRates = [
  { value: 'general', label: 'General Dentistry', multiplier: 1.0 },
  { value: 'orthodontics', label: 'Orthodontics', multiplier: 1.3 },
  { value: 'oral-surgery', label: 'Oral Surgery', multiplier: 1.4 },
  { value: 'periodontics', label: 'Periodontics', multiplier: 1.2 },
  { value: 'endodontics', label: 'Endodontics', multiplier: 1.25 },
  { value: 'pediatric', label: 'Pediatric Dentistry', multiplier: 1.15 }
];

export const EarningsCalculator = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();
  const [hoursPerWeek, setHoursPerWeek] = useState([10]);
  const [experience, setExperience] = useState('4-7');
  const [specialty, setSpecialty] = useState('general');
  const [calculatedEarnings, setCalculatedEarnings] = useState(0);

  const weeklyEarnings = useCounterAnimation(calculatedEarnings, 1500);
  const monthlyEarnings = useCounterAnimation(calculatedEarnings * 4.33, 1500);
  const yearlyEarnings = useCounterAnimation(calculatedEarnings * 52, 1500);

  useEffect(() => {
    const baseRate = experienceLevels.find(level => level.value === experience)?.rate || 120;
    const specialtyMultiplier = specialtyRates.find(spec => spec.value === specialty)?.multiplier || 1.0;
    const hourlyRate = baseRate * specialtyMultiplier;
    const weekly = hourlyRate * hoursPerWeek[0];
    
    setCalculatedEarnings(weekly);
  }, [hoursPerWeek, experience, specialty]);

  const currentHourlyRate = (() => {
    const baseRate = experienceLevels.find(level => level.value === experience)?.rate || 120;
    const specialtyMultiplier = specialtyRates.find(spec => spec.value === specialty)?.multiplier || 1.0;
    return Math.round(baseRate * specialtyMultiplier);
  })();

  return (
    <section ref={sectionRef} className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold text-primary mb-4 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Calculate Your Earning Potential
          </h2>
          <p className={`text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            See how much you could earn as a DentMentor based on your experience and specialty.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            {/* Calculator Controls */}
            <div className={`space-y-8 transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}>
              <Card className="border-2 border-primary/20 h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-primary" />
                    Earning Calculator
                  </CardTitle>
                  <CardDescription>
                    Adjust the parameters below to see your potential earnings
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between">
                  <div className="space-y-6">
                    {/* Hours per Week */}
                    <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-medium text-foreground">
                        Hours per Week
                      </label>
                      <span className="text-lg font-bold text-primary">
                        {hoursPerWeek[0]} hours
                      </span>
                    </div>
                    <Slider
                      value={hoursPerWeek}
                      onValueChange={setHoursPerWeek}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>1 hour</span>
                      <span>10 hours</span>
                    </div>
                  </div>

                  {/* Experience Level */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">
                      Years of Experience
                    </label>
                    <Select value={experience} onValueChange={setExperience}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label} (${level.rate}/hr base)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Specialty */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">
                      Specialty Area
                    </label>
                    <Select value={specialty} onValueChange={setSpecialty}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {specialtyRates.map((spec) => (
                          <SelectItem key={spec.value} value={spec.value}>
                            {spec.label} ({(spec.multiplier * 100 - 100).toFixed(0)}% {spec.multiplier >= 1 ? 'premium' : 'base'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    </div>
                  </div>

                  {/* Current Rate Display */}
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 mt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <span className="font-medium text-foreground">Your Hourly Rate</span>
                    </div>
                    <div className="text-3xl font-bold text-primary">
                      ${currentHourlyRate}/hour
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Earnings Display */}
            <div className={`space-y-6 transition-all duration-1000 delay-500 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}>
              {/* Weekly Earnings */}
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-700 group-hover:scale-105 transition-transform duration-300">Weekly Earnings</h3>
                      <p className="text-green-600">Based on {hoursPerWeek[0]} hours/week</p>
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-green-700 counter-number">
                    ${weeklyEarnings.count.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Earnings */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-700 group-hover:scale-105 transition-transform duration-300">Monthly Earnings</h3>
                      <p className="text-blue-600">Consistent monthly income</p>
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-blue-700 counter-number">
                    ${monthlyEarnings.count.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              {/* Yearly Earnings */}
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-purple-700 group-hover:scale-105 transition-transform duration-300">Annual Potential</h3>
                      <p className="text-purple-600">Total yearly earnings</p>
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-purple-700 counter-number">
                    ${yearlyEarnings.count.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};