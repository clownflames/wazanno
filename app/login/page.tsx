import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import { login } from "./actions"

export default function WazannoLoginPage() {

  async function handleLogin(formData: FormData) {
    "use server"

    const email = formData.get("email") as string
    const password = formData.get("password") as string

    await login(email, password)
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-5xl grid lg:grid-cols-2 rounded-3xl overflow-hidden border border-white/10 bg-zinc-900 shadow-2xl">

        {/* Left Side */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-700 via-black to-cyan-500">

          <div>
            <h1 className="text-5xl font-black tracking-tight">
              WAZANNO
            </h1>

            <p className="mt-6 text-lg text-zinc-200 leading-relaxed">
              Welcome back. Login and continue your journey with Wazanno.
            </p>
          </div>

          <div className="space-y-4">

            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5">
              <h3 className="text-xl font-semibold">
                Secure Access
              </h3>

              <p className="text-sm text-zinc-300 mt-2">
                Protected authentication and encrypted sessions.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5">
              <h3 className="text-xl font-semibold">
                Fast Experience
              </h3>

              <p className="text-sm text-zinc-300 mt-2">
                Instant access to your dashboard and services.
              </p>
            </div>

          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center justify-center bg-zinc-950 p-8 md:p-14">

          <Card className="w-full max-w-md bg-zinc-950 border-zinc-800 rounded-3xl shadow-none">

            <CardContent className="p-8 md:p-10">

              <div>
                <h2 className="text-4xl font-bold">
                  Login
                </h2>

                <p className="text-zinc-400 mt-2">
                  Login to continue to Wazanno.
                </p>
              </div>

              {/* Form */}
              <form
                action={handleLogin}
                className="space-y-5 mt-8"
              >

                <div>
                  <label className="text-sm text-zinc-300">
                    Email Address
                  </label>

                  <Input
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="mt-2 bg-zinc-900 border-zinc-800 h-12 rounded-2xl"
                  />
                </div>

                <div>

                  <div className="flex items-center justify-between">

                    <label className="text-sm text-zinc-300">
                      Password
                    </label>

                    <button
                      type="button"
                      className="text-sm text-cyan-400 hover:underline"
                    >
                      Forgot Password?
                    </button>

                  </div>

                  <Input
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                    className="mt-2 bg-zinc-900 border-zinc-800 h-12 rounded-2xl"
                  />

                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-base hover:opacity-90"
                >
                  Login
                </Button>

              </form>

              {/* Divider */}
              <div className="relative my-8">

                <div className="absolute inset-0 flex items-center pointer-events-none">
                  <div className="w-full border-t border-zinc-800"></div>
                </div>

                <div className="relative flex justify-center">
                  <span className="bg-zinc-950 px-4 text-zinc-500 text-sm">
                    OR CONTINUE WITH
                  </span>
                </div>

              </div>

              {/* Social Buttons */}
              <div className="grid grid-cols-2 gap-4">

                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl h-12 border-zinc-800 bg-zinc-900 hover:bg-zinc-800"
                >
                  Google
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl h-12 border-zinc-800 bg-zinc-900 hover:bg-zinc-800"
                >
                  GitHub
                </Button>

              </div>

              {/* Footer */}
              <p className="text-center text-zinc-500 mt-8 text-sm">
                Don’t have an account?{" "}

                <span className="text-cyan-400 cursor-pointer hover:underline">
                  Register
                </span>
              </p>

            </CardContent>

          </Card>

        </div>

      </div>

    </div>
  )
}