import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MinecraftButton } from '../../components/MinecraftButton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function SignUpForm({ className, onToggleView, ...props }: React.ComponentPropsWithoutRef<'div'> & { onToggleView?: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [yearOfStudy, setYearOfStudy] = useState('')
  const [degree, setDegree] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (!yearOfStudy || !degree) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    try {
      // 1. Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      })

      if (signUpError) throw signUpError

      // 2. Create profile entry with additional data
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: email,
            year: parseInt(yearOfStudy),
            degree: degree,
          })

        if (profileError) throw profileError
      }

      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred during sign up')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      {success ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Check your email</CardTitle>
            <CardDescription className="text-xl">
              We&apos;ve sent you a confirmation link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Please check your email to verify your account before signing in.
            </p>
            <MinecraftButton onClick={onToggleView} className="w-full">
              Back to Login
            </MinecraftButton>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Sign up</CardTitle>
            <CardDescription className="text-xl">Create a new account here.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label className="text-2xl" htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="quackers@u.nus.edu"
                    className="!text-xl"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-2xl" htmlFor="year">Year of Study</Label>
                  <Select value={yearOfStudy} onValueChange={setYearOfStudy} required>
                    <SelectTrigger className="!text-xl">
                      <SelectValue placeholder="Select your year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Year 1</SelectItem>
                      <SelectItem value="2">Year 2</SelectItem>
                      <SelectItem value="3">Year 3</SelectItem>
                      <SelectItem value="4">Year 4</SelectItem>
                      <SelectItem value="5">Year 5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label className="text-2xl" htmlFor="degree">Degree</Label>
                  <Select value={degree} onValueChange={setDegree} required>
                    <SelectTrigger className="!text-xl">
                      <SelectValue placeholder="Select your degree" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Business Administration">Business Administration</SelectItem>
                      <SelectItem value="Business Analytics">Business Analytics</SelectItem>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Information Systems">Information Systems</SelectItem>
                      <SelectItem value="Computer Engineering">Computer Engineering</SelectItem>
                      <SelectItem value="Business Administration (Accountancy)">Business Administration (Accountancy)</SelectItem>
                      <SelectItem value="Economics">Economics</SelectItem>
                      <SelectItem value="Engineering Science">Engineering Science</SelectItem>
                      <SelectItem value="Chemical Engineering">Chemical Engineering</SelectItem>
                      <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                      <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                      <SelectItem value="Environmental Engineering">Environmental Engineering</SelectItem>
                      <SelectItem value="Industrial & Systems Engineering">Industrial & Systems Engineering</SelectItem>
                      <SelectItem value="Materials Science & Engineering">Materials Science & Engineering</SelectItem>
                      <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                      <SelectItem value="Biomedical Engineering">Biomedical Engineering</SelectItem>
                      <SelectItem value="Architecture">Architecture</SelectItem>
                      <SelectItem value="Industrial Design">Industrial Design</SelectItem>
                      <SelectItem value="Real Estate">Real Estate</SelectItem>
                      <SelectItem value="Project & Facilities Management">Project & Facilities Management</SelectItem>
                      <SelectItem value="Landscape Architecture">Landscape Architecture</SelectItem>
                      <SelectItem value="Law">Law</SelectItem>
                      <SelectItem value="Medicine">Medicine</SelectItem>
                      <SelectItem value="Nursing">Nursing</SelectItem>
                      <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="Dentistry">Dentistry</SelectItem>
                      <SelectItem value="Life Sciences">Life Sciences</SelectItem>
                      <SelectItem value="Applied Science">Applied Science</SelectItem>
                      <SelectItem value="Food Science & Technology">Food Science & Technology</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Statistics">Statistics</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                      <SelectItem value="Data Science & Analytics">Data Science & Analytics</SelectItem>
                      <SelectItem value="Quantitative Finance">Quantitative Finance</SelectItem>
                      <SelectItem value="Philosophy">Philosophy</SelectItem>
                      <SelectItem value="Chinese Studies">Chinese Studies</SelectItem>
                      <SelectItem value="English Language & Literature">English Language & Literature</SelectItem>
                      <SelectItem value="History">History</SelectItem>
                      <SelectItem value="Geography">Geography</SelectItem>
                      <SelectItem value="Communications & New Media">Communications & New Media</SelectItem>
                      <SelectItem value="Social Work">Social Work</SelectItem>
                      <SelectItem value="Psychology">Psychology</SelectItem>
                      <SelectItem value="Political Science">Political Science</SelectItem>
                      <SelectItem value="Environmental Studies">Environmental Studies</SelectItem>
                      <SelectItem value="Global Studies">Global Studies</SelectItem>
                      <SelectItem value="Theatre Studies">Theatre Studies</SelectItem>
                      <SelectItem value="Music">Music</SelectItem>
                      <SelectItem value="Art History">Art History</SelectItem>
                      <SelectItem value="South Asian Studies">South Asian Studies</SelectItem>
                      <SelectItem value="Southeast Asian Studies">Southeast Asian Studies</SelectItem>
                      <SelectItem value="Japanese Studies">Japanese Studies</SelectItem>
                      <SelectItem value="Malay Studies">Malay Studies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label className="text-2xl" htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    className="!text-xl"
                    placeholder="quackers secret password!"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-2xl" htmlFor="repeat-password">Repeat Password</Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    className="!text-xl"
                    placeholder="quackers secret password!"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <MinecraftButton type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Sign Up'}
                </MinecraftButton>
              </div>
              <div className="mt-4 text-center text-lg">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onToggleView}
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Login
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
