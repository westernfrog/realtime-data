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
import { getSocket } from "@/socket";
import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  const socket = useMemo(() => getSocket().connect(), []);

  useEffect(() => {
    function handleConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function handleDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/getData");
        const result = await response.json();
        setChartData(result.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const throughput = parseFloat(event.target.throughput.value);
    const rssi = parseFloat(event.target.rssi.value);

    if (isNaN(throughput) || isNaN(rssi)) {
      alert("Please enter valid numbers for Throughput and RSSI");
      return;
    }

    const newData = { throughput, rssi };

    try {
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
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
              <DialogPanel className="w-full max-w-lg space-y-4 bg-[#111] border border-white/10 rounded-xl p-6">
                <DialogTitle className="font-bold text-lg">
                  Realtime Data
                </DialogTitle>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                  <div className="mb-4">
                    <label
                      htmlFor="throughput"
                      className="block font-bold mb-1"
                    >
                      Throughput
                    </label>
                    <input
                      type="number"
                      name="throughput"
                      required
                      className="w-full bg-transparent border-b border-white/10 px-2 py-1 focus:outline-none focus:ring-0"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="rssi" className="block font-bold mb-1">
                      RSSI
                    </label>
                    <input
                      type="number"
                      name="rssi"
                      required
                      className="w-full bg-transparent border-b border-white/10 px-2 py-1 focus:outline-none focus:ring-0"
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
        <div className="mt-4 text-center">
          <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
          <p>Transport: {transport}</p>
        </div>
      </section>
    </main>
  );
}
