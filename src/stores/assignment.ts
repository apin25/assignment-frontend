// stores/assignment.ts
import { defineStore } from 'pinia';
import { ref, computed } from "vue"
import { useRouter } from "vue-router"
import { useToast } from './toast';
import type { 
  AssignmentAnswerInterface,
  AssignmentDTO, 
  AssignmentRequestInterface, 
  AssignmentRequestUpdateInterface, 
  AssignmentResponseInterface, 
  ResponseWrapper 
} from "@/types/index"
import type { UserLookupDto } from '@/types/auth';

export const useAssignmentStore = defineStore('assignment', {
  state: () => ({
    assignments: [] as AssignmentDTO[],
    assignment: null as AssignmentDTO | null,
    loading: false,
    error: null as string | null,
  }),
  
  actions: {
    async getAssignments(course?: string, owner?: string, status?: string, title?: string) {
      this.loading = true;
      this.error = null;
      const toast = useToast();
      const token = localStorage.getItem('accessToken');

      const params = new URLSearchParams();
      if (course) params.append('course', course);
      if (owner) params.append('owner', owner);
      if (status) params.append('status', status)
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
        const data: ResponseWrapper<AssignmentDTO[]> = await response.json();
        this.assignments = data.data;
        toast.showToast('Berhasil mengambil daftar assignment', 'success');
      } catch (err) {
        this.error = `Gagal mengambil assignment: ${(err as Error).message}`;
        toast.showToast(this.error, 'error');
      } finally {
        this.loading = false;
      }
    },

    async addAssignment(body: AssignmentRequestInterface) {
      this.loading = true;
      this.error = null;
      const token = localStorage.getItem('accessToken');
      const router = useRouter(); 
      const toast = useToast();
      if (!token) {
      throw new Error('Token is missing')
    }

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
        const data: ResponseWrapper<AssignmentDTO> = await response.json();

        this.assignments.push(data.data);
        toast.showToast('Sukses menambahkan assignment', 'success');
        router.push('/assignments');
      } catch (err) {
        this.error = `Gagal menambah assignment: ${(err as Error).message}`;
        toast.showToast(this.error, 'error');
      } finally {
        this.loading = false;
      }
    },

    async updateAssignment(id: string, body: AssignmentRequestUpdateInterface) {
      this.loading = true;
      this.error = null;
      const token = localStorage.getItem("accessToken");
      const router = useRouter();
      const toast = useToast();


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

        const data: ResponseWrapper<AssignmentDTO> = await response.json();
        const index = this.assignments.findIndex(a => a.id === id);
        if (index !== -1) this.assignments[index] = data.data;
        toast.showToast('Berhasil mengubah assignment', 'success');
        router.push('/assignments');
      } catch (err) {
        this.error = `Gagal mengubah assignment: ${(err as Error).message}`;
        toast.showToast(this.error, 'error');
      } finally {
        this.loading = false;
      }
    },

    async getAssignmentDetail(id: string) {
      this.loading = true;
      this.error = null;
      const toast = useToast();
      const token = localStorage.getItem("accessToken");

      try {
        const response = await fetch(`http://localhost:8080/api/assignments/${id}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data: AssignmentResponseInterface = await response.json();
        this.assignment = data?.data;
        toast.showToast('Berhasil mengambil detail assignment', 'success');
      } catch (err) {
        this.error = `Gagal mengambil assignment: ${(err as Error).message}`;
        toast.showToast(this.error);
      } finally {
        this.loading = false;
      }
    },

    async deleteAssignment(id: string) {
      this.loading = true;
      this.error = null;
      const toast = useToast();
      const token = localStorage.getItem("accessToken");

      try {
        const response = await fetch(`http://localhost:8080/api/assignments/${id}/delete`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        this.assignments = this.assignments.filter(a => a.id !== id);
        toast.showToast('Berhasil menghapus assignment');
      } catch (err) {
        this.error = `Gagal menghapus assignment: ${(err as Error).message}`;
        toast.showToast(this.error);
      } finally {
        this.loading = false;
      }
    },
    async answerAssignment(id: string, body: AssignmentAnswerInterface) {
      this.loading = true;
      this.error = null;
      const toast = useToast();
      const token = localStorage.getItem("accessToken");

      try {
        const response = await fetch(
          `http://localhost:8083/api/appointment/${id}/note`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`,
             },
            body: JSON.stringify({ id, ...body }),
          },
        )
        const data: ResponseWrapper<AssignmentDTO> =
          await response.json()

        const index = this.assignments.findIndex(
          e => e.id === id,
        )
        if (index !== -1) {
          this.assignments[index] = data.data
        }

        toast.showToast('Sukses mmengumpulkan tugas',"success")
      } catch (err) {
        this.error = `Gagal mengumpulkan tugas ${(err as Error).message}`
        toast.showToast(this.error, "error")
      } finally {
        this.loading = false
      }
    },
    async getUsersSubmit(id: string) {
      this.loading = true;
      this.error = null;
      const toast = useToast();
      const token = localStorage.getItem("accessToken");

      try {
        const response = await fetch(`http://localhost:5914/api/users/search?q=${id}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const jsonResponse: { data: UserLookupDto[] } = await response.json();

        if (jsonResponse.data.length === 0) {
          this.user = null;
          toast.showToast('User tidak ditemukan', 'warning');
        } else {
          this.user = jsonResponse.data[0]; 
          toast.showToast('Berhasil mengambil user', 'success');
        }

      } catch (err) {
        this.error = `Gagal mengambil user: ${(err as Error).message}`;
        toast.showToast(this.error);
      } finally {
        this.loading = false;
      }
    }
  }
});