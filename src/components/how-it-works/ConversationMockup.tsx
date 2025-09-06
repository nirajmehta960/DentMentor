import { MessageCircle, Send, Video, Phone, MoreHorizontal } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { useTypewriter } from '@/hooks/use-typewriter';
import { useState, useEffect } from 'react';

const ConversationMockup = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation({ threshold: 0.2 });
  const [currentMessage, setCurrentMessage] = useState(0);
  
  const conversation = [
    {
      id: 1,
      type: 'received',
      sender: 'Dr. Sarah Chen',
      message: "Hi Maria! I've reviewed your NBDE Part I results. You're doing great with operative dentistry, but let's focus on improving your oral pathology scores.",
      time: '2:14 PM',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=60&h=60&fit=crop&crop=face'
    },
    {
      id: 2,
      type: 'sent',
      sender: 'You',
      message: "Thank you Dr. Chen! I've been struggling with differentiating between various lesions. Could you help me with a study plan?",
      time: '2:16 PM'
    },
    {
      id: 3,
      type: 'received',
      sender: 'Dr. Sarah Chen',
      message: "Absolutely! I'll create a structured approach focusing on high-yield topics. We'll use visual cases and mnemonics that helped me during my residency at Harvard.",
      time: '2:18 PM',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=60&h=60&fit=crop&crop=face'
    },
    {
      id: 4,
      type: 'received',
      sender: 'Dr. Sarah Chen',
      message: "I'm also scheduling a mock exam session for next week. This will help identify any remaining knowledge gaps before your real exam.",
      time: '2:19 PM',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=60&h=60&fit=crop&crop=face'
    },
    {
      id: 5,
      type: 'sent',
      sender: 'You',
      message: "That sounds perfect! I really appreciate your personalized approach. It's so different from studying alone.",
      time: '2:21 PM'
    }
  ];

  const currentText = useTypewriter({
    text: conversation[currentMessage]?.message || '',
    speed: 30,
    trigger: sectionVisible && currentMessage < conversation.length
  });

  useEffect(() => {
    if (!sectionVisible) return;

    const timer = setTimeout(() => {
      if (currentMessage < conversation.length - 1) {
        setCurrentMessage(prev => prev + 1);
      }
    }, currentText.displayText.length * 30 + 1500);

    return () => clearTimeout(timer);
  }, [currentMessage, currentText.isComplete, sectionVisible]);

  return (
    <section ref={sectionRef} className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Real Mentorship in Action
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the personalized guidance and support that makes DentMentor different. 
            See how mentors provide tailored advice and encouragement throughout your journey.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Chat Interface */}
            <div className={`scroll-animate-left ${sectionVisible ? 'animate-in' : ''}`}>
              <div className="bg-background rounded-3xl shadow-large overflow-hidden">
                {/* Chat Header */}
                <div className="bg-gradient-primary text-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=40&h=40&fit=crop&crop=face"
                      alt="Dr. Sarah Chen"
                      className="w-10 h-10 rounded-full ring-2 ring-white/20"
                    />
                    <div>
                      <div className="font-semibold">Dr. Sarah Chen</div>
                      <div className="text-xs text-white/80">Orthodontics Mentor • Online</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="p-4 space-y-4 h-96 overflow-y-auto">
                  {conversation.slice(0, currentMessage + 1).map((msg, index) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'} 
                        animate-in slide-in-from-bottom duration-500`}
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <div className={`max-w-xs lg:max-w-sm ${
                        msg.type === 'sent' 
                          ? 'bg-gradient-primary text-white' 
                          : 'bg-muted text-foreground'
                      } rounded-2xl p-3 relative`}>
                        {msg.type === 'received' && (
                          <div className="flex items-center gap-2 mb-1">
                            <img
                              src={msg.avatar}
                              alt={msg.sender}
                              className="w-4 h-4 rounded-full"
                            />
                            <span className="text-xs font-semibold">{msg.sender}</span>
                          </div>
                        )}
                        <p className="text-sm leading-relaxed">
                          {index === currentMessage ? currentText.displayText : msg.message}
                          {index === currentMessage && !currentText.isComplete && (
                            <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1"></span>
                          )}
                        </p>
                        <div className={`text-xs mt-1 ${
                          msg.type === 'sent' ? 'text-white/70' : 'text-muted-foreground'
                        }`}>
                          {msg.time}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {currentMessage < conversation.length - 1 && currentText.isComplete && (
                    <div className="flex justify-start animate-in slide-in-from-bottom">
                      <div className="bg-muted rounded-2xl p-3 flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs text-muted-foreground">Dr. Sarah is typing...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-center gap-3 bg-muted rounded-2xl p-3">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
                      disabled
                    />
                    <button className="p-2 bg-gradient-primary text-white rounded-xl hover:shadow-medium transition-all">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Features & Benefits */}
            <div className={`space-y-8 scroll-animate-right ${sectionVisible ? 'animate-in' : ''}`}>
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Personalized Mentorship Features
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Experience one-on-one guidance tailored to your specific needs and learning style.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 card-hover rounded-2xl">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Real-Time Communication</h4>
                    <p className="text-sm text-muted-foreground">
                      Instant messaging with mentors for quick questions and ongoing support
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 card-hover rounded-2xl">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Video Sessions</h4>
                    <p className="text-sm text-muted-foreground">
                      Face-to-face mentoring sessions for complex topics and mock interviews
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 card-hover rounded-2xl">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">24/7 Availability</h4>
                    <p className="text-sm text-muted-foreground">
                      Connect with mentors across different time zones whenever you need help
                    </p>
                  </div>
                </div>
              </div>

              {/* Success Quote */}
              <div className="bg-gradient-primary rounded-2xl p-6 text-white">
                <blockquote className="text-lg font-medium mb-4">
                  "The personalized feedback and constant encouragement from my mentor 
                  made all the difference in my NBDE preparation."
                </blockquote>
                <footer className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=40&h=40&fit=crop&crop=face"
                    alt="Maria Rodriguez"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="font-semibold">Maria Rodriguez</div>
                    <div className="text-white/80 text-sm">Passed NBDE Part I & II</div>
                  </div>
                </footer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConversationMockup;