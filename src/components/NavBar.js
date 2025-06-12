import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { myContactList } from "../constants/mapping";

function NavBar() {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactPosition, setContactPosition] = useState({ top: "50%", left: "50%" });
  // eslint-disable-next-line no-unused-vars
  const [mouseOverCount, setMouseOverCount] = useState(0);

  const toggleSideMenu = () => setIsSideMenuOpen((prev) => !prev);
  const toggleContact = () => setIsContactOpen((prev) => !prev);

  const handleBookmark = () => {
    const bookmarkContainer = document.getElementById("bookmark-container");
    if (bookmarkContainer) {
      for (let i = 0; i < 4; i++) {
        const newStar = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        newStar.setAttribute("class", "w-6 h-6 text-yellow-500 animate-spin");
        newStar.setAttribute("fill", "currentColor");
        newStar.setAttribute("viewBox", "0 0 20 20");
        newStar.setAttribute("xmlns", "http://www.w3.org/2000/svg");

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute(
          "d",
          "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.392 2.46a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.54 1.118l-3.392-2.46a1 1 0 00-1.176 0l-3.392 2.46c-.784.57-1.84-.197-1.54-1.118l1.286-3.97a1 1 0 00-.364-1.118L2.049 9.397c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.97z"
        );
        newStar.appendChild(path);
        bookmarkContainer.appendChild(newStar);
      }
    } else {
      console.error("Bookmark container not found");
    }
    alert("컨트롤 + D를 눌러 즐겨찾기를 추가해주세요 :)");
  };

  useEffect(() => {
    if (isContactOpen) {
      const contactElement = document.getElementById("contact-element");
      const handleMouseOver = () => {
        setMouseOverCount((prevCount) => {
          if (prevCount < 5) {
            const randomTop = `${Math.floor(Math.random() * 80) + 10}%`;
            const randomLeft = `${Math.floor(Math.random() * 80) + 10}%`;
            setContactPosition({ top: randomTop, left: randomLeft });
            return prevCount + 1;
          } else {
            contactElement.removeEventListener("mouseover", handleMouseOver);
            return prevCount;
          }
        });
      };
      contactElement.addEventListener("mouseover", handleMouseOver);
      return () => contactElement.removeEventListener("mouseover", handleMouseOver);
    }
  }, [isContactOpen]);

  return (
    <>
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center pt-4 pb-2">
            <div className="flex items-center space-x-4">
              <div id="bookmark-container" className="flex items-center space-x-2">
                <svg
                  className="w-6 h-6 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.392 2.46a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.54 1.118l-3.392-2.46a1 1 0 00-1.176 0l-3.392 2.46c-.784.57-1.84-.197-1.54-1.118l1.286-3.97a1 1 0 00-.364-1.118L2.049 9.397c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.97z"></path>
                </svg>
                <button
                  className="font-bold text-gray-600 hover:text-gray-800 transition duration-300"
                  onClick={handleBookmark}
                  id="bookmark">
                  즐겨찾기
                </button>
              </div>
            </div>

            <ul className="hidden md:flex space-x-8">
              {["/", "https://velog.io/@fuzzy/posts", "/career"].map((link, index) => (
                <li key={index}>
                  {link.startsWith("http") ? (
                    <a
                      href={link}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="font-bold text-gray-600 hover:text-blue-800 hover:border-b-2 hover:border-blue-800 transition duration-300">
                      {index === 0 ? "Home" : index === 1 ? "Blog" : "Cafe"}
                    </a>
                  ) : (
                    <Link
                      to={link}
                      className="font-bold text-gray-600 hover:text-blue-800 hover:border-b-2 hover:border-blue-800 transition duration-300">
                      {index === 0 ? "Home" : "Cafe"}
                    </Link>
                  )}
                </li>
              ))}
              <li>
                <button
                  className="font-bold text-gray-600 hover:text-blue-800 hover:border-b-2 hover:border-blue-800 transition duration-300"
                  onClick={toggleContact}>
                  Contact
                </button>
              </li>
            </ul>
          </div>
          <div className="mt-1 h-px bg-gray-200"></div>
          <div className="flex justify-between items-center py-4">
            <button
              className="text-gray-500 hover:text-gray-700 focus:outline-none transition duration-300 ease-in-out transform hover:scale-150"
              onClick={toggleSideMenu}>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>

            <Link
              to="/"
              className="text-2xl font-bold text-gray-800 hover:text-gray-700 transition duration-300 mx-auto">
              <img src="/images/logos/wasrem_main.jpg" alt="Fuzzy Logo" className="mx-auto w-48" />
            </Link>
          </div>
        </div>

        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out ${
            isSideMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={toggleSideMenu}></div>

        <div
          className={`fixed top-0 left-0 w-64 h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
            isSideMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}>
          <div className="p-6">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none transition duration-300 ease-in-out transform hover:rotate-180"
              onClick={toggleSideMenu}>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            <ul className="flex flex-col space-y-6 mt-8">
              {["/", "https://velog.io/@fuzzy/posts", "/career"].map((link, index) => (
                <li key={index}>
                  {link.startsWith("http") ? (
                    <a
                      href={link}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="font-bold text-gray-600 hover:text-gray-800 transition duration-300"
                      onClick={toggleSideMenu}>
                      {index === 0 ? "Home" : "Blog"}
                    </a>
                  ) : (
                    <Link
                      to={link}
                      className="font-bold text-gray-600 hover:text-gray-800 transition duration-300"
                      onClick={toggleSideMenu}>
                      {index === 0 ? "Home" : "ezfuzzy's career"}
                    </Link>
                  )}
                </li>
              ))}
              <li>
                <button
                  className="font-bold text-gray-600 hover:text-gray-800 transition duration-300"
                  onClick={() => {
                    toggleSideMenu();
                    toggleContact();
                  }}>
                  Contact
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {isContactOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out"
            onClick={toggleContact}></div>
          <div
            id="contact-element"
            className="fixed flex items-center justify-center p-4 z-50 transition-transform duration-300 ease-in-out max-w-sm mx-auto font-bold"
            style={{ top: contactPosition.top, left: contactPosition.left }}
            onClick={toggleContact}>
            <div
              className="bg-gradient-to-r from-green-700 via-green-500 to-green-300 p-6 rounded-lg shadow-2xl transform transition duration-500 ease-in-out hover:scale-125"
              onClick={(e) => e.stopPropagation()}>
              <ul className="space-y-4">
                {myContactList.map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.href}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="text-black hover:border-b-2 hover:border-white transition duration-300">
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default NavBar;
