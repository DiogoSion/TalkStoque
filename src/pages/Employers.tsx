import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Employee } from '../types/employee';
import EmployeeForm from '../components/EmployeeForm';
import ModalWrapper from '../components/ModalWrapper';
import ConfirmModal from '../components/ConfirmModal';
import AddButton from '../components/AddButton';
import TableWrapper from '../components/TableWrapper';
import ActionButtons from '../components/ActionButtons';

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
        <AddButton
          label="Employee"
          onClick={() => {
            setEditingEmployee(null);
            setIsModalOpen(true);
          }}
        />
      </div>

      <TableWrapper columns={["Name", "Role", "Email", "Phone", "Start Date", "Actions"]}>
        {employees.map((employee) => (
          <tr key={employee.id}>
            <td className="px-6 py-4">{employee.name}</td>
            <td className="px-6 py-4">{employee.role}</td>
            <td className="px-6 py-4">{employee.email}</td>
            <td className="px-6 py-4">{employee.phone}</td>
            <td className="px-6 py-4">{employee.startDate}</td>
            <td className="px-6 py-4 flex space-x-2">
              <ActionButtons
                onEdit={() => {
                  setEditingEmployee(employee);
                  setIsModalOpen(true);
                }}
                onDelete={() => setEmployeeToDelete(employee)}
              />
            </td>
          </tr>
        ))}
      </TableWrapper>

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
