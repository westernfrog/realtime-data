"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState, useEffect } from "react";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/getData");
      const result = await response.json();
      setChartData(result.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const throughput = parseFloat(event.target.throughput.value);
    const rssi = parseFloat(event.target.rssi.value);

    if (isNaN(throughput) || isNaN(rssi)) {
      alert("Please enter valid numbers for Throughput and RSSI");
      return;
    }

    const newData = {
      throughput,
      rssi,
    };

    try {
      console.log(newData);

      const response = await fetch("/api/createData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newData),
      });

      if (response.ok) {
        setIsOpen(false);
        event.target.reset();
      } else {
        alert("Failed to save data");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save data");
    }
  };

  return (
    <main className="fixed inset-0 flex items-center justify-center">
      <section className="max-w-7xl mx-auto w-full">
        <div style={{ width: "100%", height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              width={500}
              height={300}
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="throughput"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="rssi"
                stroke="#82ca9d"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center mt-12">
          <button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-800 transition duration-300 ease-in-out rounded"
          >
            Add Data
          </button>
          <Dialog
            open={isOpen}
            onClose={() => setIsOpen(false)}
            className="relative z-50"
          >
            <div className="fixed inset-0 flex w-screen items-center justify-center p-4 bg-black/60">
              <DialogPanel
                transition
                className="min-w-7xl lg:w-[30%] space-y-4 bg-[#111] border border-white/10 rounded-xl p-6"
              >
                <DialogTitle className="font-bold text-lg flex items-center gap-2">
                  Realtime Data
                </DialogTitle>
                <form
                  action=""
                  onSubmit={handleSubmit}
                  className="space-y-6 py-4"
                >
                  <div className="border-1 border-b ring-white mb-2">
                    <label htmlFor="throughput" className="font-bold">
                      Throughput
                    </label>
                    <input
                      type="number"
                      name="throughput"
                      className="bg-transparent w-full ring-0 border-0 placeholder-white focus:outline-0 focus:ring-0 px-0 py-1 text-sm"
                    />
                  </div>
                  <div className="border-1 border-b ring-white mb-2">
                    <label htmlFor="rssi" className="font-bold">
                      RSSI
                    </label>
                    <input
                      type="number"
                      name="rssi"
                      className="bg-transparent w-full ring-0 border-0 placeholder-white focus:outline-0 focus:ring-0 px-0 py-1 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="block w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-800 transition duration-300 ease-in-out rounded"
                  >
                    Save
                  </button>
                </form>
              </DialogPanel>
            </div>
          </Dialog>
        </div>
      </section>
    </main>
  );
}
