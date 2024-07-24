import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('Sending...');

    emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      formData,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    )
    .then((result) => {
      setStatus('Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
    })
    .catch((error) => {
      setStatus('Failed to send message. Please try again.');
      console.error('Email sending error:', error);
    });
  };

  return (
    <section className="body-font relative text-gray-400" id="contact">
      <div className="container mx-auto px-5 py-24">
        <div className="mb-12 flex w-full flex-col text-center">
          <h1 className="title-font mb-4 text-2xl font-medium text-white sm:text-3xl">
            Contact Me
          </h1>
          <p className="mx-auto text-base leading-relaxed lg:w-2/3">
            Feel free to reach out to me for any opportunities, collaborations, or
            questions.
          </p>
        </div>
        <div className="mx-auto md:w-2/3 lg:w-1/2">
          <form onSubmit={handleSubmit}>
            <div className="-m-2 flex flex-wrap">
              <div className="w-1/2 p-2">
                <div className="relative">
                  <label htmlFor="name" className="text-sm leading-7 text-gray-400">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-700 bg-gray-800 bg-opacity-40 px-3 py-1 text-base leading-8 text-gray-100 outline-none transition-colors duration-200 ease-in-out focus:border-indigo-500 focus:bg-gray-900 focus:ring-2 focus:ring-indigo-900"
                  />
                </div>
              </div>
              <div className="w-1/2 p-2">
                <div className="relative">
                  <label htmlFor="email" className="text-sm leading-7 text-gray-400">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-700 bg-gray-800 bg-opacity-40 px-3 py-1 text-base leading-8 text-gray-100 outline-none transition-colors duration-200 ease-in-out focus:border-indigo-500 focus:bg-gray-900 focus:ring-2 focus:ring-indigo-900"
                  />
                </div>
              </div>
              <div className="w-full p-2">
                <div className="relative">
                  <label htmlFor="message" className="text-sm leading-7 text-gray-400">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="h-32 w-full resize-none rounded border border-gray-700 bg-gray-800 bg-opacity-40 px-3 py-1 text-base leading-6 text-gray-100 outline-none transition-colors duration-200 ease-in-out focus:border-indigo-500 focus:bg-gray-900 focus:ring-2 focus:ring-indigo-900"
                  ></textarea>
                </div>
              </div>
              <div className="w-full p-2">
                <button
                  type="submit"
                  className="mx-auto flex rounded border-0 bg-indigo-500 px-8 py-2 text-lg text-white hover:bg-indigo-600 focus:outline-none"
                >
                  Send Message
                </button>
              </div>
              {status && (
                <div className="w-full p-2 text-center text-white">
                  <p>{status}</p>
                </div>
              )}
              <div className="w-full border-t border-gray-800 p-2 pt-8 text-center">
                <p className="my-5 leading-normal">or</p>
                <span className="inline-flex">
                  <a
                    target="_blank"
                    href="https://linkedin.com/in/nxdun"
                    aria-label="LinkedIn"
                    className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-800 text-gray-400 transition-all duration-300 hover:text-white hover:bg-blue-600 hover:from-blue-200 hover:to-blue-700"
                  >
                    <div className="absolute bottom-0 left-0 top-auto h-0 w-full bg-blue-700 transition-all duration-300"></div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="currentColor"
                      className="relative z-10"
                      viewBox="0 0 16 16"
                    >
                      <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"></path>
                    </svg>
                  </a>
                  <a
                    href="https://www.github.com/nxdun"
                    target="_blank"
                    aria-label="GitHub"
                    className="relative ml-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-800 text-gray-400 transition-all duration-300 hover:text-white hover:bg-gray-900"
                  >
                    <div className="absolute bottom-0 left-0 top-auto h-0 w-full bg-gray-900 transition-all duration-300"></div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="currentColor"
                      className="relative z-10"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.075.55-.173.55-.385 0-.19-.007-.695-.01-1.364-2.224.48-2.697-1.071-2.697-1.071-.365-.925-.893-1.17-.893-1.17-.729-.498.056-.488.056-.488.808.058 1.33.831 1.33.831.717 1.226 1.884.871 2.345.665.073-.519.28-.871.51-1.07-1.78-.202-3.655-.894-3.655-3.973 0-.878.313-1.597.827-2.158-.083-.203-.359-1.03.079-2.145 0 0 .676-.216 2.22.827.64-.178 1.328-.266 2.008-.27.68.004 1.368.092 2.008.27 1.54-1.043 2.214-.827 2.214-.827.435 1.116.166 1.942.08 2.145.518.561.827 1.28.827 2.158 0 3.085-1.883 3.773-3.67 3.97.28.24.528.72.528 1.443 0 1.044-.009 1.884-.009 2.14 0 .216.148.464.56.385C13.71 14.527 16 11.54 16 8c0-4.42-3.58-8-8-8z"></path>
                    </svg>
                  </a>
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
