// stores/assignment.ts
import { defineStore } from 'pinia';
import type {
  AssignmentInterface,
  AssignmentRequestInterface,
  AssignmentRequestUpdateInterface,
} from '@/interfaces/assignment.interface';
import type { CommonResponseInterface } from '@/interfaces/common.interface';
import type { AssignmentResponseInterface } from '@/interfaces/assignment.interface';
import router from '@/router';
import Cookies from 'js-cookie';
import { useToast } from 'vue-toastification';

export const useAssignmentStore = defineStore('assignment', {
  state: () => ({
    assignments: [] as AssignmentInterface[],
    assignment: null as AssignmentInterface | null,
    loading: false,
    error: null as string | null,
  }),
  
  actions: {
async getAssignments(course?: string, owner?: string, status?: string, title?: string) {
  this.loading = true;
  this.error = null;
  const token = Cookies.get('token');

  const params = new URLSearchParams();
  if (course) params.append('course', course);
  if (owner) params.append('owner', owner);
  if (status) {

    params.append('dueStatus', status === 'Overdue' ? 'overDue' : 'onTime');
  }
  if (title) params.append('title', title);

  try {
    const response = await fetch(`http://localhost:8080/api/assignments?${params.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data: CommonResponseInterface<AssignmentInterface[]> = await response.json();
    this.assignments = data.data;
    useToast().success('Berhasil mengambil daftar assignment');
  } catch (err) {
    this.error = `Gagal mengambil assignment: ${(err as Error).message}`;
    useToast().error(this.error);
  } finally {
    this.loading = false;
  }
},
    async addAssignment(body: AssignmentRequestInterface) {
      this.loading = true;
      this.error = null;
      const token = Cookies.get('token');

      try {
        const response = await fetch(`http://localhost:8080/api/assignments`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data: CommonResponseInterface<AssignmentInterface> =
          await response.json()

        this.assignments.push(data.data)
        useToast().success('Sukses menambahkan assignment');
        router.push('/assignments');
      } catch (err) {
        this.error = `Gagal menambah assignment: ${(err as Error).message}`;
        useToast().error(this.error);
      } finally {
        this.loading = false;
      }
    },

    async updateAssignment(id: string, body: AssignmentRequestUpdateInterface) {
      this.loading = true;
      this.error = null;
      const token = Cookies.get('token');

      try {
        const response = await fetch(`http://localhost:8080/api/assignments/${id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, ...body }),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data: CommonResponseInterface<AssignmentInterface> = await response.json();
        const index = this.assignments.findIndex(a => a.id === id);
        if (index !== -1) this.assignments[index] = data.data;
        useToast().success('Berhasil mengubah assignment');
        router.push('/assignments');
      } catch (err) {
        this.error = `Gagal mengubah assignment: ${(err as Error).message}`;
        useToast().error(this.error);
      } finally {
        this.loading = false;
      }
    },

    async getAssignmentDetail(id: string) {
      this.loading = true;
      this.error = null;
      const token = Cookies.get('token');

      try {
        const response = await fetch(`http://localhost:8080/api/assignments/${id}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data: AssignmentResponseInterface = await response.json()
        if (response.ok) {
          this.assignment = data?.data;
        } else {
          this.error = `Error fetching assignment: ${response.status}`;
          useToast().error(this.error);
        }
      } catch (err) {
        this.error = `Gagal mengambil assignment: ${(err as Error).message}`;
        useToast().error(this.error);
      } finally {
        this.loading = false;
      }
    },

    async deleteAssignment(id: string) {
      this.loading = true;
      this.error = null;
      const token = Cookies.get('token');

      try {
        const response = await fetch(`http://localhost:8080/api/assignments/${id}/delete`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          this.assignments = this.assignments.filter(a => a.id !== id);
          useToast().success('Berhasil menghapus assignment');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (err) {
        this.error = `Gagal menghapus assignment: ${(err as Error).message}`;
        useToast().error(this.error);
      } finally {
        this.loading = false;
      }
    },
    
  }
  
});
