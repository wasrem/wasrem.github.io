import React from "react"

function Footer() {
  return (
    <>
      <footer className="bg-green-600 text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} ezfuzzy. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}

export default Footer
