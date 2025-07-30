import { useState } from "react";
import Modal from "./Modal";

const dummyCustomers = [
  { id: 1, name: "Acme Corp", type: "corporate" },
  { id: 2, name: "Jane Doe", type: "individual" },
];
const dummyPolicies = [
  { id: 101, customer: "Acme Corp", status: "active" },
  { id: 102, customer: "Jane Doe", status: "pending" },
];
const dummyOffers = [
  { id: 201, customer: "Acme Corp", status: "pending" },
  { id: 202, customer: "Jane Doe", status: "approved" },
];

export default function AgentDashboard({ page }: { page: string }) {
  const [selected, setSelected] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  if (page === "dashboard") {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">My Customers</h2>
        <table className="w-full bg-white dark:bg-gray-800 rounded shadow mb-8">
          <thead>
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Name</th>
              <th className="p-2">Type</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dummyCustomers.map(c => (
              <tr key={c.id}>
                <td className="p-2">{c.id}</td>
                <td className="p-2">{c.name}</td>
                <td className="p-2 capitalize">{c.type}</td>
                <td className="p-2">
                  <button className="text-blue-600" onClick={() => { setSelected(c); setShowModal(true); }}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {showModal && selected && (
          <Modal onClose={() => setShowModal(false)}>
            <div>
              <h3 className="font-bold mb-2">Edit Customer</h3>
              <div>Name: {selected.name}</div>
              <div>Type: {selected.type}</div>
              <button className="mt-4 px-3 py-1 bg-blue-600 text-white rounded" onClick={() => setShowModal(false)}>Save</button>
            </div>
          </Modal>
        )}
      </div>
    );
  }
  if (page === "customers") {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">All Assigned Customers</h2>
        <ul className="space-y-2">
          {dummyCustomers.map(c => (
            <li key={c.id} className="bg-white dark:bg-gray-800 p-4 rounded shadow flex justify-between items-center">
              <span>{c.name} <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{c.type}</span></span>
              <button className="text-blue-600" onClick={() => { setSelected(c); setShowModal(true); }}>Edit</button>
            </li>
          ))}
        </ul>
        {showModal && selected && (
          <Modal onClose={() => setShowModal(false)}>
            <div>
              <h3 className="font-bold mb-2">Edit Customer</h3>
              <div>Name: {selected.name}</div>
              <div>Type: {selected.type}</div>
              <button className="mt-4 px-3 py-1 bg-blue-600 text-white rounded" onClick={() => setShowModal(false)}>Save</button>
            </div>
          </Modal>
        )}
      </div>
    );
  }
  if (page === "policies") {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">My Policies</h2>
        <table className="w-full bg-white dark:bg-gray-800 rounded shadow">
          <thead>
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Customer</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {dummyPolicies.map(p => (
              <tr key={p.id}>
                <td className="p-2">{p.id}</td>
                <td className="p-2">{p.customer}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs ${p.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (page === "offers") {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">Offers</h2>
        <table className="w-full bg-white dark:bg-gray-800 rounded shadow">
          <thead>
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Customer</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dummyOffers.map(o => (
              <tr key={o.id}>
                <td className="p-2">{o.id}</td>
                <td className="p-2">{o.customer}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs ${o.status === "approved" ? "bg-green-100 text-green-800" : o.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-gray-200 text-gray-800"}`}>{o.status}</span>
                </td>
                <td className="p-2">
                  <button className="text-green-600 mr-2" onClick={() => alert("Approved offer " + o.id)}>Approve</button>
                  <button className="text-red-600" onClick={() => alert("Rejected offer " + o.id)}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return null;
}