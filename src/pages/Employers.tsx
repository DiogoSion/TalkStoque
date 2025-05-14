import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Employee } from '../types/employee';
import EmployeeForm from '../components/EmployeeForm';
import ModalWrapper from '../components/ModalWrapper';
import ConfirmModal from '../components/ConfirmModal';

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

      {isModalOpen && (
        <ModalWrapper
          title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
          onClose={handleCancel}
        >
          <EmployeeForm
            initialData={editingEmployee || {}}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isEditing={!!editingEmployee}
          />
        </ModalWrapper>
      )}

      {employeeToDelete && (
        <ConfirmModal
          title="Confirm Deletion"
          message={`Are you sure you want to delete ${employeeToDelete.name}?`}
          onCancel={() => setEmployeeToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
