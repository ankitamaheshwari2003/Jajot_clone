import { Suspense } from "react";
import "./globals.css";
import Navbar from "./component/navbar";
import Footer from "./component/footer";
import GoogleAuthProvider from "./provider/GoogleAuthProvider";

export const metadata = {
  metadataBase: new URL("https://www.yourdomain.com"),
  title: "Amazon clone",
  description: "Premium E-commerce Website"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <GoogleAuthProvider>
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          <main>{children}</main>
          <Footer />
        </GoogleAuthProvider>
      </body>
    </html>);

}
