export const Footer = () => (
    <footer className="text-gray-400 bg-gray-900 body-font">
      <div className="container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col">
        <a className="flex title-font font-medium items-center text-white md:justify-start justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-10 h-10 text-white p-2 bg-indigo-500 rounded-full" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <span className="ml-3 text-xl">Nadun Lakshan</span>
        </a>
        <p className="text-sm text-gray-500 sm:ml-6 sm:pl-6 sm:border-l border-gray-800 sm:py-2 sm:mt-0 mt-4">© 2024 Nadun Lakshan —
          <a href="https://twitter.com" className="text-gray-400 ml-1" target="_blank" rel="noopener noreferrer">@nadun</a>
        </p>
        <span className="inline-flex sm:ml-auto sm:mt-0 mt-4 justify-center sm:justify-start">
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
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"></path>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/nadu.lk"
                target="_blank"
                aria-label="Instagram"
                className="relative ml-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-800 text-gray-400 transition-all duration-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-500 hover:via-pink-500 hover:to-red-500"
              >
                <div className="absolute bottom-0 left-0 top-auto h-0 w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 transition-all duration-300"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  className="relative z-10"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.748.415c-.522.195-.962.46-1.452.95-.49.49-.756.93-.951 1.452C.51 3.83.376 4.411.336 5.264.297 6.117.287 6.39.287 8.562c0 2.172.01 2.445.049 3.298.04.853.174 1.434.369 1.956.195.522.46.962.95 1.452.49.49.93.756 1.452.951.522.195 1.103.33 1.956.369.853.038 1.127.048 3.298.048 2.172 0 2.445-.01 3.298-.049.853-.04 1.434-.174 1.956-.369.522-.195.962-.46 1.452-.95.49-.49.756-.93.951-1.452.195-.522.33-1.103.369-1.956.038-.853.048-1.127.048-3.298 0-2.172-.01-2.445-.049-3.298-.04-.853-.174-1.434-.369-1.956a3.617 3.617 0 0 0-.951-1.452 3.617 3.617 0 0 0-1.452-.951c-.522-.195-1.103-.33-1.956-.369C10.445.01 10.171 0 8 0zm0 1.533c2.138 0 2.398.008 3.243.046.784.035 1.209.157 1.492.261.375.145.641.319.923.601.283.283.457.549.601.923.104.283.226.708.261 1.492.038.845.046 1.105.046 3.243s-.008 2.398-.046 3.243c-.035.784-.157 1.209-.261 1.492a2.73 2.73 0 0 1-.601.923 2.73 2.73 0 0 1-.923.601c-.283.104-.708.226-1.492.261-.845.038-1.105.046-3.243.046s-2.398-.008-3.243-.046c-.784-.035-1.209-.157-1.492-.261a2.73 2.73 0 0 1-.923-.601 2.73 2.73 0 0 1-.601-.923c-.104-.283-.226-.708-.261-1.492-.038-.845-.046-1.105-.046-3.243s.008-2.398.046-3.243c.035-.784.157-1.209.261-1.492.145-.375.319-.641.601-.923.283-.283.549-.457.923-.601.283-.104.708-.226 1.492-.261.845-.038 1.105-.046 3.243-.046zm0 2.855a3.612 3.612 0 1 0 0 7.225 3.612 3.612 0 0 0 0-7.225zm0 5.94a2.329 2.329 0 1 1 0-4.658 2.329 2.329 0 0 1 0 4.658zm5.768-6.618a.844.844 0 1 0 0 1.688.844.844 0 0 0 0-1.688z"></path>
                </svg>
              </a>

              <a
                href="https://api.whatsapp.com/send?phone=94774364177"
                target="_blank"
                aria-label="WhatsApp"
                className="relative ml-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-800 text-gray-400 transition-all duration-300 hover:bg-green-500 hover:text-white"
              >
                <div className="absolute bottom-0 left-0 top-auto h-0 w-full bg-green-500 transition-all duration-300"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  className="relative z-10"
                  viewBox="0 0 16 16"
                >
                  <path d="M8.034 0C3.602 0 0 3.602 0 8.034c0 1.417.372 2.81 1.085 4.027L0 16l3.992-1.056a7.977 7.977 0 0 0 4.042 1.048c4.432 0 8.034-3.602 8.034-8.034S12.466 0 8.034 0zm3.66 11.233c-.122.345-.702.64-1.221.715-.33.05-.726.092-1.155-.055a12.21 12.21 0 0 1-2.175-1.02c-1.933-1.146-3.204-3.071-3.305-3.206-.102-.136-.791-1.055-.791-2.014 0-.96.49-1.44.665-1.634a.65.65 0 0 1 .478-.221c.12 0 .24.002.345.008.127.007.269.016.411.453.16.472.589 1.65.639 1.771.05.12.082.26.016.375-.08.133-.12.217-.24.333-.12.116-.253.26-.361.349-.112.093-.229.195-.098.384.133.195.592.98 1.287 1.594.887.784 1.633 1.021 1.856 1.13.229.12.36.108.493-.065.133-.173.566-.66.716-.885.152-.224.304-.187.506-.11.202.077 1.274.602 1.493.715.22.112.366.165.42.257.056.092.056.535-.066.88z"></path>
                </svg>
              </a>
            
        </span>
      </div>
    </footer>
  );