import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import ReCAPTCHA from "react-google-recaptcha";

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("");
  const [captcha, setCaptcha] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCaptchaChange = (token) => {
    setCaptcha(token);
  };

  const handleCaptchaExpired = () => {
    setCaptcha("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!captcha) {
      setStatus("CaptchaError");
      return;
    }

    setStatus("Sending...");

    try {
      // Verify CAPTCHA
      const server = import.meta.env.VITE_SERVER_URL;
      const response = await fetch(server, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ captcha }),
      });

      if (!response.ok) {
        throw new Error("CAPTCHA verification failed");
      }

      const captchaResult = await response.json();
      if (!captchaResult.success) {
        setStatus("CaptchaError");
        return;
      }

      // Send email
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        formData,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setStatus("Success");
      setFormData({ name: "", email: "", message: "" });
      setCaptcha("");
    } catch (error) {
      setStatus("Error");
      console.error("Error:", error);
    }
  };

  return (
    <section className="body-font relative text-gray-400" id="contact">
      <div className="container mx-auto px-5 py-24">
        <div className="mb-12 flex w-full flex-col text-center">
          <h1 className="title-font mb-4 text-2xl font-medium text-white sm:text-3xl">
            Contact Me
          </h1>
          <p className="mx-auto text-base leading-relaxed lg:w-2/3">
            Feel free to reach out to me for any opportunities, collaborations,
            or questions.
          </p>
        </div>
        <div className="mx-auto md:w-2/3 lg:w-1/2">
          <form onSubmit={handleSubmit}>
            <div className="-m-2 flex flex-wrap">
              <div className="w-1/2 p-2">
                <div className="relative">
                  <label
                    htmlFor="name"
                    className="text-sm leading-7 text-gray-400"
                  >
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
                  <label
                    htmlFor="email"
                    className="text-sm leading-7 text-gray-400"
                  >
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
                  <label
                    htmlFor="message"
                    className="text-sm leading-7 text-gray-400"
                  >
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
              <div className="w-full p-1 flex flex-col items-center">
  <div className="mx-3 my-3">
    <ReCAPTCHA
      sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
      onChange={handleCaptchaChange}
      onExpired={handleCaptchaExpired}
      data-testid="recaptcha"
      theme="dark"
      
    />
  </div>
  <button
    type="submit"
    className="mx-auto flex rounded border-0 bg-indigo-500 px-8 py-2 text-lg text-white hover:bg-indigo-600 focus:outline-none"
  >
    Send Message
  </button>
</div>
              <div className="w-full p-2 text-center">
                {status === "Sending..." && (
                  <div
                    role="alert"
                    className="flex transform items-center rounded-lg border-l-4 border-blue-500 bg-blue-100 p-2 text-blue-900 transition duration-300 ease-in-out hover:scale-105 hover:bg-blue-200 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800"
                  >
                    <svg
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="mr-2 h-5 w-5 flex-shrink-0 text-blue-600"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        stroke-width="2"
                        stroke-linejoin="round"
                        stroke-linecap="round"
                      ></path>
                    </svg>
                    <p className="text-xs font-semibold">
                      Sending - Please wait...
                    </p>
                  </div>
                )}
                {status === "Success" && (
                  <div
                    role="alert"
                    className="flex transform items-center rounded-lg border-l-4 border-green-500 bg-green-100 p-2 text-green-900 transition duration-300 ease-in-out hover:scale-105 hover:bg-green-200 dark:border-green-700 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800"
                  >
                    <svg
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="mr-2 h-5 w-5 flex-shrink-0 text-green-600"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        stroke-width="2"
                        stroke-linejoin="round"
                        stroke-linecap="round"
                      ></path>
                    </svg>
                    <p className="text-xs font-semibold">
                      Success - Everything went smoothly!
                    </p>
                  </div>
                )}
                {status === "Error" && (
                  <div
                    role="alert"
                    className="flex transform items-center rounded-lg border-l-4 border-red-500 bg-red-100 p-2 text-red-900 transition duration-300 ease-in-out hover:scale-105 hover:bg-red-200 dark:border-red-700 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800"
                  >
                    <svg
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="mr-2 h-5 w-5 flex-shrink-0 text-red-600"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        stroke-width="2"
                        stroke-linejoin="round"
                        stroke-linecap="round"
                      ></path>
                    </svg>
                    <p className="text-xs font-semibold">
                      Error - Something went wrong!
                    </p>
                  </div>
                )}
                {status === "CaptchaError" && (
                  <div
                    role="alert"
                    className="flex transform items-center rounded-lg border-l-4 border-yellow-500 bg-yellow-100 p-2 text-yellow-900 transition duration-300 ease-in-out hover:scale-105 hover:bg-yellow-200 dark:border-yellow-700 dark:bg-yellow-900 dark:text-yellow-100 dark:hover:bg-yellow-800"
                  >
                    <svg
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="mr-2 h-5 w-5 flex-shrink-0 text-yellow-600"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        stroke-width="2"
                        stroke-linejoin="round"
                        stroke-linecap="round"
                      ></path>
                    </svg>
                    <p className="text-xs font-semibold">
                      Error - CAPTCHA verification failed. Please try again.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
