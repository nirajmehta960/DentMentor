import {
  MessageCircle,
  Send,
  Video,
  Phone,
  MoreHorizontal,
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useTypewriter } from "@/hooks/use-typewriter";
import { useState, useEffect } from "react";

const ConversationMockup = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation({
    threshold: 0.2,
  });
  const [currentMessage, setCurrentMessage] = useState(0);

  const conversation = [
    {
      id: 1,
      type: "received",
      sender: "Dr. Sarah Chen",
      message:
        "Hi Maria! I've reviewed your CV and SOP. Your experience is impressive, but let's strengthen your personal statement to better highlight your unique journey.",
      time: "2:14 PM",
      avatar:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=60&h=60&fit=crop&crop=face",
    },
    {
      id: 2,
      type: "sent",
      sender: "You",
      message:
        "Thank you Dr. Chen! I've been struggling with how to present my international background. Could you help me with the application strategy?",
      time: "2:16 PM",
    },
    {
      id: 3,
      type: "received",
      sender: "Dr. Sarah Chen",
      message:
        "Absolutely! I'll help you craft a compelling narrative that showcases your strengths. We'll focus on schools that value diverse experiences like yours.",
      time: "2:18 PM",
      avatar:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=60&h=60&fit=crop&crop=face",
    },
    {
      id: 4,
      type: "received",
      sender: "Dr. Sarah Chen",
      message:
        "I'm also scheduling a mock interview session for next week. This will help you practice common questions and build confidence for the real interviews.",
      time: "2:19 PM",
      avatar:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=60&h=60&fit=crop&crop=face",
    },
    {
      id: 5,
      type: "sent",
      sender: "You",
      message:
        "That sounds perfect! I really appreciate your personalized approach. It's so different from trying to figure everything out alone.",
      time: "2:21 PM",
    },
  ];

  const currentText = useTypewriter({
    text: conversation[currentMessage]?.message || "",
    speed: 30,
    trigger: sectionVisible && currentMessage < conversation.length,
  });

  useEffect(() => {
    if (!sectionVisible) return;

    const timer = setTimeout(() => {
      if (currentMessage < conversation.length - 1) {
        setCurrentMessage((prev) => prev + 1);
      }
    }, currentText.displayText.length * 30 + 1500);

    return () => clearTimeout(timer);
  }, [currentMessage, currentText.isComplete, sectionVisible]);

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4 sm:mb-5 md:mb-6 px-4">
            Live Mentorship Experience
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Experience the personalized guidance and support that makes
            DentMentor different. See how mentors provide tailored advice and
            encouragement throughout your journey.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-start">
            {/* Chat Interface */}
            <div
              className={`scroll-animate-left ${
                sectionVisible ? "animate-in" : ""
              } px-4 sm:px-0`}
            >
              <div className="bg-background rounded-2xl sm:rounded-3xl shadow-large overflow-hidden">
                {/* Chat Header */}
                <div className="bg-gradient-primary text-white p-3 sm:p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <img
                      src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=40&h=40&fit=crop&crop=face"
                      alt="Dr. Sarah Chen"
                      className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full ring-2 ring-white/20 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-sm sm:text-base truncate">
                        Dr. Sarah Chen
                      </div>
                      <div className="text-[10px] sm:text-xs text-white/80">
                        Orthodontics Mentor • Online
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <button className="p-1.5 sm:p-2 hover:bg-white/20 hover:scale-110 rounded-lg transition-all duration-200">
                      <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button className="p-1.5 sm:p-2 hover:bg-white/20 hover:scale-110 rounded-lg transition-all duration-200">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button className="p-1.5 sm:p-2 hover:bg-white/20 hover:scale-110 rounded-lg transition-all duration-200">
                      <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 h-80 sm:h-96 overflow-y-auto">
                  {conversation
                    .slice(0, currentMessage + 1)
                    .map((msg, index) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.type === "sent" ? "justify-end" : "justify-start"
                        } 
                        animate-in slide-in-from-bottom duration-500`}
                        style={{ animationDelay: `${index * 200}ms` }}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-xs lg:max-w-sm ${
                            msg.type === "sent"
                              ? "bg-gradient-primary text-white"
                              : "bg-muted text-foreground"
                          } rounded-xl sm:rounded-2xl p-2.5 sm:p-3 relative`}
                        >
                          {msg.type === "received" && (
                            <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                              <img
                                src={msg.avatar}
                                alt={msg.sender}
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full"
                              />
                              <span className="text-[10px] sm:text-xs font-semibold">
                                {msg.sender}
                              </span>
                            </div>
                          )}
                          <p className="text-xs sm:text-sm leading-relaxed">
                            {index === currentMessage
                              ? currentText.displayText
                              : msg.message}
                            {index === currentMessage &&
                              !currentText.isComplete && (
                                <span className="inline-block w-1.5 sm:w-2 h-3 sm:h-4 bg-current animate-pulse ml-1"></span>
                              )}
                          </p>
                          <div
                            className={`text-[10px] sm:text-xs mt-1 ${
                              msg.type === "sent"
                                ? "text-white/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {msg.time}
                          </div>
                        </div>
                      </div>
                    ))}

                  {/* Typing Indicator */}
                  {currentMessage < conversation.length - 1 &&
                    currentText.isComplete && (
                      <div className="flex justify-start animate-in slide-in-from-bottom">
                        <div className="bg-muted rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex items-center gap-1.5 sm:gap-2">
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                            <div
                              className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                          <span className="text-[10px] sm:text-xs text-muted-foreground">
                            Dr. Sarah is typing...
                          </span>
                        </div>
                      </div>
                    )}
                </div>

                {/* Chat Input */}
                <div className="p-3 sm:p-4 border-t border-border">
                  <div className="flex items-center gap-2 sm:gap-3 bg-muted rounded-xl sm:rounded-2xl p-2 sm:p-3">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm placeholder:text-muted-foreground"
                      disabled
                    />
                    <button className="p-1.5 sm:p-2 bg-gradient-primary text-white rounded-lg sm:rounded-xl hover:shadow-lg hover:scale-110 transition-all duration-200">
                      <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Features & Benefits */}
            <div
              className={`space-y-6 sm:space-y-8 scroll-animate-right ${
                sectionVisible ? "animate-in" : ""
              } px-4 sm:px-0 mt-8 lg:mt-0`}
            >
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
                  Personalized Mentorship Features
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Experience one-on-one guidance tailored to your specific needs
                  and learning style.
                </p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 card-hover rounded-xl sm:rounded-2xl">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-primary rounded-lg sm:rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm sm:text-base font-semibold text-foreground mb-1 sm:mb-2">
                      Real-Time Communication
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Instant messaging with mentors for quick questions and
                      ongoing support
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 card-hover rounded-xl sm:rounded-2xl">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-secondary rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Video className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm sm:text-base font-semibold text-foreground mb-1 sm:mb-2">
                      Video Sessions
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Face-to-face mentoring sessions for complex topics and
                      mock interviews
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 card-hover rounded-xl sm:rounded-2xl">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-accent rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm sm:text-base font-semibold text-foreground mb-1 sm:mb-2">
                      Flexible Scheduling
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Schedule sessions with mentors at times that work for both
                      of you
                    </p>
                  </div>
                </div>
              </div>

              {/* Success Quote */}
              <div className="bg-gradient-primary rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-white">
                <blockquote className="text-sm sm:text-base md:text-lg font-medium mb-3 sm:mb-4">
                  "The personalized CV review and mock interview sessions from
                  my mentor made all the difference in my dental school
                  application success."
                </blockquote>
                <footer className="flex items-center gap-2 sm:gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=40&h=40&fit=crop&crop=face"
                    alt="Maria Rodriguez"
                    className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-sm sm:text-base font-semibold">
                      Maria Rodriguez
                    </div>
                    <div className="text-white/80 text-xs sm:text-sm">
                      Accepted to Harvard Dental School
                    </div>
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
