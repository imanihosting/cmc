import Image from 'next/image'
import Link from 'next/link'
import { Search, CheckCircle, Baby, Euro } from 'lucide-react'

const testimonials = [
  {
    name: "Sarah Thompson",
    role: "Parent",
    image: "https://images.unsplash.com/photo-1601288496920-b6154fe3626a?w=150&h=150&fit=crop",
    content: "Finding a trustworthy childminder was so easy with ChildMinderConnect. My children love their new carer!"
  },
  {
    name: "Michael Roberts",
    role: "Childminder",
    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop",
    content: "This platform has helped me connect with wonderful families and grow my childminding business."
  },
  {
    name: "Emma Wilson",
    role: "Parent",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop",
    content: "The verification process gave me peace of mind. I found the perfect childminder for my twins!"
  }
];

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl shadow-xl overflow-hidden">
            <div className="px-8 py-16 sm:p-16 text-center text-white">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                <span className="text-white">Connecting Families with</span>
                <br />
                <span className="bg-gradient-to-r from-violet-300 to-purple-200 bg-clip-text text-transparent">
                  Trusted Childcare Providers
                </span>
              </h1>
              <p className="mt-6 text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
                Easily find trusted childminders near you to care for your little ones. 
                Subscribe to unlock full access to our verified childminders network.
              </p>

              <div className="max-w-2xl mx-auto mb-8">
                <div className="flex gap-2 p-2 bg-white/10 backdrop-blur-sm rounded-full">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input 
                      type="text"
                      placeholder="Search by location or keyword"
                      className="w-full pl-10 pr-4 py-3 bg-white rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-300"
                    />
                  </div>
                  <button className="px-6 py-3 bg-violet-500 hover:bg-violet-400 text-white rounded-full transition-all duration-300 transform hover:scale-105">
                    Search
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <button className="px-8 py-3 bg-violet-500 hover:bg-violet-400 text-white rounded-full transition-all duration-300 transform hover:scale-105">
                  I'm a Parent
                </button>
                <button className="px-8 py-3 bg-pink-100 hover:bg-pink-200 text-violet-600 rounded-full transition-all duration-300 transform hover:scale-105">
                  I'm a Childminder
                </button>
              </div>

              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-violet-300" />
                  <span>Garda Vetted</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-violet-300" />
                  <span>Verified Reviews</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-violet-300" />
                  <span>Subscription Required</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
            <div className="p-8 sm:p-12">
              <h2 className="text-3xl font-bold text-center mb-8">Simple, Transparent Pricing</h2>
              <div className="flex flex-col md:flex-row justify-center items-center gap-8">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-2xl shadow-md w-full md:w-auto">
                  <h3 className="text-2xl font-semibold text-purple-600 mb-4">Monthly Plan</h3>
                  <div className="flex items-center justify-center mb-4">
                    <Euro className="h-8 w-8 text-purple-500 mr-2" />
                    <span className="text-4xl font-bold">4.99</span>
                    <span className="text-gray-600 ml-2">/month</span>
                  </div>
                  <ul className="text-gray-600 mb-6">
                    <li className="flex items-center mb-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      Full access to childminder profiles
                    </li>
                    <li className="flex items-center mb-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      Direct messaging with childminders
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      Cancel anytime
                    </li>
                  </ul>
                  <Link href="/sign-in" className="w-full bg-purple-600 text-white py-2 px-4 rounded-full hover:bg-purple-700 transition duration-300">
                    Subscribe Monthly
                  </Link>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-2xl shadow-md w-full md:w-auto relative overflow-hidden">
                  <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Save 17%
                  </div>
                  <h3 className="text-2xl font-semibold text-indigo-600 mb-4">Yearly Plan</h3>
                  <div className="flex items-center justify-center mb-4">
                    <Euro className="h-8 w-8 text-indigo-500 mr-2" />
                    <span className="text-4xl font-bold">49.99</span>
                    <span className="text-gray-600 ml-2">/year</span>
                  </div>
                  <ul className="text-gray-600 mb-6">
                    <li className="flex items-center mb-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      All features of Monthly Plan
                    </li>
                    <li className="flex items-center mb-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      Priority support
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      Exclusive yearly member benefits
                    </li>
                  </ul>
                  <Link href="/sign-in" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-full hover:bg-indigo-700 transition duration-300">
                    Subscribe Yearly
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <hr className="border-gray-200 my-12" />
      </div>

      {/* Features Section */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
            Why Choose ChildMinderConnect?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Verified Childminders",
                description: "All our childminders undergo thorough background checks and verification processes."
              },
              {
                title: "Flexible Scheduling",
                description: "Find childcare that fits your schedule, whether it's full-time, part-time, or occasional."
              },
              {
                title: "Easy Communication",
                description: "Our platform facilitates seamless communication between parents and childminders."
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <hr className="border-gray-200 my-12" />
      </div>

      {/* Testimonials Section */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
            What Our Users Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={50}
                    height={50}
                    className="rounded-full mr-4"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <hr className="border-gray-200 my-12" />
      </div>

      {/* CTA Section */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl shadow-xl overflow-hidden">
            <div className="px-8 py-16 sm:p-16 text-center text-white">
              <h2 className="text-3xl font-extrabold mb-4">Ready to Find Your Perfect Childminder?</h2>
              <p className="text-xl mb-8">Join ChildMinderConnect today and discover trusted childcare in your area.</p>
              <Link 
                href="/sign-up" 
                className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 inline-block"
              >
                Get Started Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

