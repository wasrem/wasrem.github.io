import React from "react"
import { Link } from "react-router-dom"
import { appList } from "../constants/mapping"

function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <div className="grid xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mt-8">
          {/* 각 카드 아이템 */}
          {appList.map((item, index) => (
            <li key={index} className="list-none">
              <Link
                to={item.to}
                className="block border-2 border-green-900 rounded-lg p-4 hover:shadow-2xl hover:scale-105 transform transition duration-300 ease-in-out h-[300px] flex flex-col justify-between">
                <span className="block flex-grow mb-2 h-[200px] overflow-hidden rounded-xl">
                  <img src={item.img} alt={item.alt} className="w-full h-full object-cover rounded" />
                </span>
                <span className="block text-center text-lg font-semibold mt-auto">{item.title}</span>
              </Link>
            </li>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
