import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, Mail, Phone, MapPin, 
  Play, Utensils, Dog, Users,
  ChevronDown, ChevronUp,
  Shield, CheckCircle, Camera, Clock, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const faqs = [
  {
    question: "How does watching ads help feed dogs?",
    answer: "When you watch an ad, advertisers pay a small amount. We use 100% of that revenue to purchase food for stray dogs through our network of verified feeders in Nepal and other countries."
  },
  {
    question: "How many ads do I need to watch to provide a meal?",
    answer: "Every 5 ads you watch provides one warm chicken and rice meal for a stray dog. The meal costs approximately $0.30 to prepare and serve."
  },
  {
    question: "Where are the dogs being fed?",
    answer: "Our feeding network currently operates in Nepal, India, Thailand, and Turkey. We're expanding to more countries as our community grows."
  },
  {
    question: "How do I know my contributions are actually providing a meal?",
    answer: "Every meal provided is documented with a photo and geo-tagged location, with the date and time, by our verified feeders. This ensures that the location, photos, time and date stamped cannot be duplicated and that the meals fed are unique feeding events and not duplicates. You can see the photo carousel in the My Dogs section of the app."
  },
  {
    question: "Do you allow multiple people to feed the same dog?",
    answer: "Yes. In an attempt to ensure a regular and stable supply of food to stray dogs, each dog can have an average of 3 but as many as 20 people supporting depending on their engagement rates. This ensures that averaged out over the week the dog will be fed 3-5 times."
  },
  {
    question: "Why is a dog in 'My Dogs' no longer available for feeding?",
    answer: "Sometimes a dog may have too many supporters, may have been adopted, or sadly may have passed away. However, in the majority of cases, we use AI to monitor the body condition score of the dogs. Once a dog has a healthy level of fat, we try to find dogs which are very skinny and struggling a lot to allocate meals to as part of our emergency feeding triaging system."
  },
  {
    question: "Can I become a feeder?",
    answer: "Yes! If you're in a location with stray dogs and want to help feed them, you can register as a feeder through our app. We'll verify your account and you can start logging your feedings."
  },
  {
    question: "Is there a limit to how many ads I can watch?",
    answer: "There's no daily limit! Watch as many ads as you'd like to help feed more dogs. However, ads may be limited based on advertiser availability in your region."
  },
  {
    question: "What food is being fed? I'm concerned over the quality of the food the dogs are being fed.",
    answer: "Our feeders are given advice from a certified vet nutritionist who recommends food based on local accessible ingredients. Where possible we encourage biscuit formulated feed as this is the most nutritionally balanced. Where biscuit feed is not available, providing base carbohydrates and protein to increase fat composition is critical. If you are still concerned that the amount or quality of food given to the dogs is an issue, please do contact us at samuel@imscap.com and let us know the dog's name and location."
  },
  {
    question: "Why do some dogs not get meat/chicken meals?",
    answer: "We want to help dogs all over the world — including those living in countries which do not believe in feeding meat (such as Hindu countries). We work with our feeders to provide the necessary advice on supplementing food with legumes and beans as sources of protein."
  }
];

export default function Mission() {
  const [openFaq, setOpenFaq] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch {
        setUser(null);
      }
    };
    getUser();
  }, []);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;

    setIsSubmitting(true);
    try {
      await base44.entities.DevMessage.create({
        user_email: user?.email || 'anonymous',
        user_name: user?.full_name || 'Anonymous',
        message: feedbackMessage.trim(),
      });
      toast.success('Thanks for your feedback! We\'ll review it shortly.');
      setFeedbackMessage('');
    } catch (error) {
      toast.error('Failed to send feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 pb-24">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-orange-400/20" />
        <div className="relative px-6 pt-8 pb-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-2"
          >
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
          </motion.div>
          <h1 className="text-2xl font-bold text-amber-900">Our Mission</h1>
          <p className="text-amber-700 mt-1">Feed 1 million homeless dogs worldwide</p>
        </div>
      </div>

      <div className="px-6 space-y-8">
        {/* More Information Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100"
        >
          <h2 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
            <Dog className="w-5 h-5 text-amber-500" />
            About Feed a Stray
          </h2>
          <div className="space-y-4 text-amber-800">
            <p>
              Feed a Stray was founded with a simple mission: to ensure no stray dog goes hungry. 
              We connect compassionate people worldwide with local feeders who provide warm meals 
              to homeless dogs every day.
            </p>
            <p>
              By watching short advertisements, you directly fund nutritious chicken and rice meals 
              for stray dogs in Nepal, India, Thailand, Turkey, and beyond. Every view counts, 
              every meal matters.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                 <p className="text-2xl font-bold text-amber-600">2K+</p>
                 <p className="text-xs text-amber-500">Meals Served</p>
               </div>
               <div className="text-center">
                 <p className="text-2xl font-bold text-amber-600">1000+</p>
                 <p className="text-xs text-amber-500">Stray Dogs Fed</p>
               </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">4</p>
                <p className="text-xs text-amber-500">Countries</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* How Ad-Feeding Works Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100"
        >
          <h2 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-amber-500" />
            How Ad-Feeding Works
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <span className="text-amber-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-medium text-amber-900">You Watch an Ad</h3>
                <p className="text-sm text-amber-700">Watch a short 15-30 second advertisement in the app</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <span className="text-amber-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-medium text-amber-900">Advertisers Pay</h3>
                <p className="text-sm text-amber-700">Brands pay for your attention - we collect 100% for the dogs</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <span className="text-amber-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-medium text-amber-900">Feeders Cook Meals</h3>
                <p className="text-sm text-amber-700">Local feeders prepare fresh chicken & rice meals</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <span className="text-amber-600 font-bold">4</span>
              </div>
              <div>
                <h3 className="font-medium text-amber-900">Dogs Get Fed</h3>
                <p className="text-sm text-amber-700">Stray dogs receive warm, nutritious meals daily</p>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl">
            <p className="text-center text-amber-800 font-medium">
              🐕 3 Ads = 1 Warm Meal 🍚
            </p>
          </div>
        </motion.section>

        {/* Quality Assurance Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100"
        >
          <h2 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            Quality Assurance
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-900">Verified Feeders</h3>
                <p className="text-sm text-amber-700">All feeders are vetted and verified before joining our network</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Camera className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-900">Photo Documentation</h3>
                <p className="text-sm text-amber-700">Every feeding is documented with photos showing dogs being fed</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-900">Location Tracking</h3>
                <p className="text-sm text-amber-700">Feedings are logged with location data for transparency</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-900">Real-Time Updates</h3>
                <p className="text-sm text-amber-700">See feeding updates in the gallery as they happen</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* FAQs Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100"
        >
          <h2 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-amber-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-amber-50 transition-colors"
                >
                  <span className="font-medium text-amber-900 pr-4">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="px-4 pb-4"
                  >
                    <p className="text-sm text-amber-700">{faq.answer}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.section>

        {/* Feedback & Support Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100"
        >
          <h2 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-500" />
            Feedback & Support
          </h2>
          <p className="text-sm text-amber-700 mb-4">
            Found a bug? Have a question? We'd love to hear from you. Send your feedback directly to our development team.
          </p>
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div>
              <Textarea
                placeholder="Report bugs, ask questions, or share feedback..."
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                className="border-amber-200 focus:border-amber-400 resize-none h-28"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting || !feedbackMessage.trim()}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 py-5 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Sending...' : 'Send Feedback'}
            </Button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-amber-100">
            <p className="text-xs text-amber-600 mb-3 font-medium">DIRECT CONTACT</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-amber-700">
                <Mail className="w-4 h-4 text-amber-500" />
                <span className="text-sm">hello@feedastray.org</span>
              </div>
              <div className="flex items-center gap-3 text-amber-700">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span className="text-sm">Kathmandu, Nepal</span>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}