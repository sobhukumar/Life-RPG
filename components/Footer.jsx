export default function Footer() {
  return (
    <footer className="w-full bg-[#120a21] border-t-4 border-[#2e263f] py-6">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-black text-[14px] uppercase text-[#ffb0cd]" style={{ fontFamily: 'Rubik' }}>Made by team EliteX</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="font-medium text-[13px] text-[#e1bdc8]" style={{ fontFamily: 'Rubik' }}>"Small steps every day lead to big changes."</span>
        </div>
      </div>
    </footer>
  )
}
