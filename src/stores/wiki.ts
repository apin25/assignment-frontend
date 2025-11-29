// stores/wiki.ts
import { defineStore } from 'pinia';
import { ref, computed } from "vue"
import { useRouter } from "vue-router"
import { useToast } from './toast';
import type { 
  WikiDTO, 
  WikiRequestInterface, 
  WikiRequestUpdateInterface, 
  WikiResponseInterface, 
  ResponseWrapper 
} from "@/types/index"

export const useWikiStore = defineStore('wiki', {
  state: () => ({
    wikis: [] as WikiDTO[],
    wiki: null as WikiDTO | null,
    loading: false,
    error: null as string | null,
  }),
  
  actions: {
    async getWikis(course?: string, owner?: string, title?: string) {
      this.loading = true;
      this.error = null;
      const toast = useToast();
      const token = localStorage.getItem('accessToken');

      const params = new URLSearchParams();
      if (course) params.append('course', course);
      if (owner) params.append('owner', owner);
      if (title) params.append('title', title);

      try {
        const response = await fetch(`http://localhost:8080/api/wikis?${params.toString()}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data: ResponseWrapper<WikiDTO[]> = await response.json();
        this.wikis = data.data;
        toast.showToast('Berhasil mengambil daftar wiki', 'success');
      } catch (err) {
        this.error = `Gagal mengambil wiki: ${(err as Error).message}`;
        toast.showToast(this.error, 'error');
      } finally {
        this.loading = false;
      }
    },

    async addWiki(body: WikiRequestInterface) {
      this.loading = true;
      this.error = null;
      const token = localStorage.getItem('accessToken');
      const router = useRouter(); 
      const toast = useToast();
      if (!token) {
      throw new Error('Token is missing')
    }

      try {
        const response = await fetch(`http://localhost:8080/api/wikis`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data: ResponseWrapper<WikiDTO> = await response.json();

        this.wikis.push(data.data);
        toast.showToast('Sukses menambahkan wiki', 'success');
        router.push('/wikis');
      } catch (err) {
        this.error = `Gagal menambah wiki: ${(err as Error).message}`;
        toast.showToast(this.error, 'error');
      } finally {
        this.loading = false;
      }
    },

    async updateWiki(id: string, body: WikiRequestUpdateInterface) {
      this.loading = true;
      this.error = null;
      const token = localStorage.getItem("accessToken");
      const router = useRouter();
      const toast = useToast();


      try {
        const response = await fetch(`http://localhost:8080/api/wikis/${id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, ...body }),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data: ResponseWrapper<WikiDTO> = await response.json();
        const index = this.wikis.findIndex(a => a.id === id);
        if (index !== -1) this.wikis[index] = data.data;
        toast.showToast('Berhasil mengubah wiki', 'success');
        router.push('/wikis');
      } catch (err) {
        this.error = `Gagal mengubah wiki: ${(err as Error).message}`;
        toast.showToast(this.error, 'error');
      } finally {
        this.loading = false;
      }
    },

    async getWikiDetail(id: string) {
      this.loading = true;
      this.error = null;
      const toast = useToast();
      const token = localStorage.getItem("accessToken");

      try {
        const response = await fetch(`http://localhost:8080/api/wikis/${id}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Fix: Consistent error handling
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data: WikiResponseInterface = await response.json();
        this.wiki = data?.data;
        toast.showToast('Berhasil mengambil detail wiki', 'success');
      } catch (err) {
        this.error = `Gagal mengambil wiki: ${(err as Error).message}`;
        toast.showToast(this.error);
      } finally {
        this.loading = false;
      }
    },

    async deleteWiki(id: string) {
      this.loading = true;
      this.error = null;
      const toast = useToast();
      const token = localStorage.getItem("accessToken");

      try {
        const response = await fetch(`http://localhost:8080/api/wikis/${id}/delete`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        this.wikis = this.wikis.filter(a => a.id !== id);
        toast.showToast('Berhasil menghapus wiki');
      } catch (err) {
        this.error = `Gagal menghapus wiki: ${(err as Error).message}`;
        toast.showToast(this.error);
      } finally {
        this.loading = false;
      }
    },
  }
});