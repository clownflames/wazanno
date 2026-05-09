import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { registerUser } from "./actions"

export default function WazannoRegisterPage() {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-6xl grid text-white lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-900">

                {/* Left Side */}
                <div className="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-purple-700 via-black to-pink-600">
                    <div>
                        <h1 className="text-5xl font-black tracking-tight">
                            WAZANNO
                        </h1>

                        <p className="mt-6 text-lg text-zinc-200 leading-relaxed">
                            Create your account and unlock a modern digital experience.
                            Join the future with Wazanno.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                            <h3 className="text-xl font-semibold">
                                Fast & Secure
                            </h3>

                            <p className="text-sm text-zinc-300 mt-2">
                                Your data is protected with modern security systems.
                            </p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                            <h3 className="text-xl font-semibold">
                                Easy Access
                            </h3>

                            <p className="text-sm text-zinc-300 mt-2">
                                Access your account anytime from any device.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side */}
                <div className="p-8 md:p-14 flex flex-col text-white justify-center bg-zinc-950">
                    <Card className="max-w-md w-full mx-auto bg-zinc-950 border-zinc-800 rounded-3xl shadow-2xl">
                        <CardContent className="p-8 md:p-10">

                            {/* Heading */}
                            <div className="mb-8">
                                <h2 className="text-4xl font-bold">
                                    Create Account
                                </h2>

                                <p className="text-zinc-400 mt-2">
                                    Sign up to continue to Wazanno.
                                </p>
                            </div>

                            {/* Form */}
                            <form className="space-y-5" action={registerUser} >

                                <div>
                                    <label className="text-sm text-zinc-300">
                                        Full Name
                                    </label>

                                    <Input
                                        type="text"
                                        placeholder="Enter your full name"
                                        name="fullName"
                                        className="mt-2 bg-zinc-900 text-white border-zinc-800 h-12 rounded-2xl"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-zinc-300">
                                        Email Address
                                    </label>

                                    <Input
                                        type="email"
                                        name="email"
                                        placeholder="Enter your email"
                                        className="mt-2 bg-zinc-900 text-white border-zinc-800 h-12 rounded-2xl"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-zinc-300">
                                        Username
                                    </label>

                                    <Input
                                        type="text"
                                        name="username"
                                        placeholder="Choose a username"
                                        className="mt-2 bg-zinc-900 text-white border-zinc-800 h-12 rounded-2xl"
                                    />
                                </div>


                                <div>
                                    <label className="text-sm text-zinc-300">
                                        Age
                                    </label>

                                    <Input
                                        type="number"
                                        name="age"
                                        placeholder="Enter your age"
                                        className="mt-2 bg-zinc-900 text-white border-zinc-800 h-12 rounded-2xl"
                                    />
                                </div>



                                <div>
                                    <label className="text-sm text-zinc-300">
                                        Password
                                    </label>

                                    <Input
                                        type="password"
                                        name="password"
                                        placeholder="Create a password"
                                        className="mt-2 bg-zinc-900 text-white border-zinc-800 h-12 rounded-2xl"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-zinc-300">
                                        Confirm Password
                                    </label>

                                    <Input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Confirm your password"
                                        className="mt-2 bg-zinc-900 text-white border-zinc-800 h-12 rounded-2xl"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-base hover:opacity-90"
                                >
                                    Create Account
                                </Button>
                            </form>

                            {/* Divider */}
                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center pointer-events-none">
                                    <div className="w-full border-t border-zinc-800"></div>
                                </div>

                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-zinc-950 px-4 text-zinc-500">
                                        OR
                                    </span>
                                </div>
                            </div>

                            {/* Social Buttons */}
                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    variant="outline"
                                    className="rounded-2xl h-12 border-zinc-800 bg-zinc-900 hover:bg-zinc-800"
                                >
                                    Google
                                </Button>

                                <Button
                                    variant="outline"
                                    className="rounded-2xl h-12 border-zinc-800 bg-zinc-900 hover:bg-zinc-800"
                                >
                                    GitHub
                                </Button>
                            </div>

                            {/* Footer */}
                            <p className="text-center text-zinc-500 mt-8 text-sm">
                                Already have an account?{" "}

                                <span className="text-purple-400 cursor-pointer hover:underline">
                                    Login
                                </span>
                            </p>

                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}