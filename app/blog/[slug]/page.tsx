import Link from 'next/link';

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen bg-bg-primary pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="text-xs font-mono text-text-muted mb-6 flex items-center gap-1">
          <Link href="/" className="hover:text-text-primary">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-text-primary">Blog</Link>
          <span>/</span>
          <span className="text-text-secondary">{params.slug}</span>
        </nav>

        <article className="prose">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs font-mono">Linux Internals</span>
            <span className="text-xs text-text-muted">12 min read · May 2025</span>
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-6">
            How read() Really Works: From Syscall to Disk and Back
          </h1>

          <p>
            Every time your program calls <code>read()</code>, a remarkable journey begins. What looks like a simple
            function call triggers a cascade of operations spanning user space, the Linux kernel, the VFS layer, filesystem
            drivers, and finally the hardware itself.
          </p>

          <h2>The Journey Begins in User Space</h2>
          <p>
            When you call <code>read(fd, buf, count)</code> in C, you&apos;re actually calling a wrapper function in glibc.
            This wrapper sets up the necessary registers and executes the <code>syscall</code> instruction
            (or <code>int 0x80</code> on older systems), transferring control to the kernel.
          </p>

          <pre><code>{`// What glibc does internally
// On x86_64:
mov rax, 0        // syscall number for read
mov rdi, fd       // file descriptor
mov rsi, buf      // buffer address
mov rdx, count    // byte count
syscall           // trap to kernel`}</code></pre>

          <h2>Kernel Entry</h2>
          <p>
            The kernel receives the syscall, validates the arguments, and dispatches to the <code>sys_read()</code>
            function. Before any I/O happens, the kernel checks permissions and verifies the file descriptor is valid.
          </p>

          <div className="p-4 bg-accent-green/5 border border-accent-green/20 rounded-xl my-4">
            <p className="text-sm text-accent-green font-mono">💡 Try This in Syscall Detective</p>
            <p className="text-sm text-text-secondary mt-1">
              Analyze any file-reading program to see exactly how many read() calls it makes and their latency.
            </p>
            <Link href="/analyze" className="inline-block mt-2 text-sm text-accent-green hover:underline">
              Launch Analyzer →
            </Link>
          </div>

          <h2>The VFS Layer</h2>
          <p>
            Linux&apos;s Virtual File System (VFS) provides a unified interface for all filesystem types. Whether you&apos;re
            reading from ext4, tmpfs, or a network filesystem, the kernel calls the same VFS operations, which then
            delegate to the specific filesystem implementation.
          </p>
        </article>
      </div>
    </div>
  );
}
