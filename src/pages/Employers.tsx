import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Employee } from '../types/employee';
import EmployeeForm from '../components/EmployeeForm';

const sampleEmployees: Employee[] = [/* seus funcionários iniciais */];

export default function Employers() {
  const [employees, setEmployees] = useState<Employee[]>(sampleEmployees);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const handleSubmit = (data: Partial<Employee>) => {
    if (editingEmployee) {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === editingEmployee.id ? { ...editingEmployee, ...data } as Employee : emp
        )
      );
    } else {
      const newEmployee: Employee = {
        id: Date.now().toString(),
        name: data.name || '',
        role: data.role || '',
        email: data.email || '',
        phone: data.phone || '',
        startDate: data.startDate || ''
      };
      setEmployees((prev) => [...prev, newEmployee]);
    }
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  const confirmDelete = () => {
    if (employeeToDelete) {
      setEmployees((prev) => prev.filter((e) => e.id !== employeeToDelete.id));
      setEmployeeToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Employers Management</h2>
        <button
          onClick={() => {
            setEditingEmployee(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Employee
        </button>
      </div>

      {/* Employees Table */}
      <table className="min-w-full divide-y divide-gray-200 bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3">Role</th>
            <th className="px-6 py-3">Email</th>
            <th className="px-6 py-3">Phone</th>
            <th className="px-6 py-3">Start Date</th>
            <th className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td className="px-6 py-4">{employee.name}</td>
              <td className="px-6 py-4">{employee.role}</td>
              <td className="px-6 py-4">{employee.email}</td>
              <td className="px-6 py-4">{employee.phone}</td>
              <td className="px-6 py-4">{employee.startDate}</td>
              <td className="px-6 py-4 flex space-x-2">
                <button
                  onClick={() => {
                    setEditingEmployee(employee);
                    setIsModalOpen(true);
                  }}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setEmployeeToDelete(employee)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </h3>
            <EmployeeForm
              initialData={editingEmployee || {}}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isEditing={!!editingEmployee}
            />
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {employeeToDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="mb-4 text-gray-700">
              Are you sure you want to delete <strong>{employeeToDelete.name}</strong>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEmployeeToDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}