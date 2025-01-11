import Image from 'next/image'
import Link from 'next/link'

export default function About() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl shadow-xl overflow-hidden">
            <div className="px-8 py-16 sm:p-16 text-center text-white">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                About ChildMinderConnect
              </h1>
              <p className="mt-6 text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
                Connecting families with trusted childminders since 2023
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <hr className="border-gray-200 my-12" />
      </div>

      {/* Mission Section */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-xl text-gray-600 mb-6">
                At ChildMinderConnect, we believe every child deserves quality care and every parent deserves peace of mind. Our mission is to create a trusted platform that connects families with experienced, reliable childminders in their local community.
              </p>
              <p className="text-xl text-gray-600">
                We strive to make the process of finding and booking childcare as seamless and stress-free as possible, allowing parents to focus on what matters most - their children.
              </p>
            </div>
            <div className="mt-12 lg:mt-0">
              <Image
                src="/placeholder.svg"
                alt="Happy children playing"
                width={600}
                height={400}
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <hr className="border-gray-200 my-12" />
      </div>

      {/* Values Section */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Safety First</h3>
              <p className="text-gray-600">We prioritize the safety and well-being of children above all else. Our rigorous vetting process ensures only trusted childminders are on our platform.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Care</h3>
              <p className="text-gray-600">We believe in providing access to high-quality childcare that supports children's growth, learning, and development.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Building</h3>
              <p className="text-gray-600">We're committed to fostering a supportive community of parents and childminders, built on trust and mutual respect.</p>
            </div>
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
              <h2 className="text-3xl font-extrabold mb-4">Join Our Community</h2>
              <p className="text-xl mb-8">
                Whether you're a parent looking for reliable childcare or a childminder looking to grow your business, ChildMinderConnect is here to support you.
              </p>
              <Link 
                href="/signup" 
                className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 inline-block"
              >
                Get Started Today
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

