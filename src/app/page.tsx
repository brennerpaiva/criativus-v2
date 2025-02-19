
export default function Page() {


  return (
    <div className="w-screen min-h-screen max-w-full overflow-hidden">
      {/* PRIMEIRA SEÇÃO, COM SCROLL INTERNO */}
      <section className="relative w-screen h-screen overflow-y-auto">
        
        {/* BG absoluto, cobrindo SÓ esta seção, z-0 */}
        <div
          className="
            absolute
            inset-0
            bg-center
            bg-cover
            bg-no-repeat
            filter
            blur-sm
            z-0
          "
          style={{ backgroundImage: "url('/bg.png')" }}
        />

        {/* Overlay branca semi-transparente: z-10 */}
        <div className="absolute inset-0 bg-white/80 z-10" />

        {/* Conteúdo: precisa ser "relative" e ter z-20 */}
        <div className="relative z-20 flex h-full flex-col container mx-auto">
          {/* Navbar (também vai ficar acima do overlay) */}
          <nav className="mt-8 w-full h-14 bg-white backdrop-blur shadow-md rounded">
            <ul className="flex space-x-4 p-2">
              <li>Home</li>
              <li>About</li>
              <li>Contact</li>
            </ul>
          </nav>

          {/* Agora o H1 estará visível, pois está acima (z-20) */}
          <div className="mt-8">
            <h1 className="text-4xl text-black">Bem vindo</h1>
            <video controls width="720">
              <source src="https://scontent-gru2-2.xx.fbcdn.net/v/t15.5256-10/476416524_1307158967160632_8953124811550169818_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=e3495b&_nc_ohc=VXjYtWOzMGQQ7kNvgGF-RH4&_nc_zt=23&_nc_ht=scontent-gru2-2.xx&edm=APRAPSkEAAAA&_nc_gid=ANkTOvkEmBo-dO82Qt1rNHE&oh=00_AYAuwRIwfhycNMLbZD8HRSE94iuVfOK3oa8SxYwdSOjaig&oe=67B9C46D" type="video/mp4"></source>
              Seu navegador não suporta vídeos.
            </video>

          </div>
        </div>
      </section>

      {/* SEGUNDA SEÇÃO (fora do scroll da primeira) */}
      <section className="w-screen h-screen bg-red-300 flex items-center justify-center">
        <h1 className="text-4xl">Seção 2</h1>
      </section>
    </div>
  );
}
